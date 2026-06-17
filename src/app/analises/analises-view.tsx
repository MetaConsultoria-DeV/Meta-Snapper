"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { BRL } from "@/lib/mock-data";
import type { FactDTO } from "@/lib/api/bdu";
import { Card, SectionTitle, Bar } from "@/components/dashboard/primitives";
import { MetaSelect } from "@/components/dashboard/meta-select";
import { Icon } from "@/components/dashboard/icon";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { AdaptiveTable } from "@/components/ui/adaptive-table";

type Fact = {
  projetoId: number;
  projeto: string;
  valor: number;
  membroId: number | null;
  coord: string;
  cliente: string;
  cargo: string;
  membro: string;
  celula: string;
  status: string;
};
type Cell = { proj: Set<number>; mem: Set<number>; valor: Map<number, number>; count: number };
type ARow = { a: string; total: number; row: Map<string, Cell> };

// Dimensões limitadas ao que está populado no banco (ver contexto-banco-agent):
// projeto_servico está vazia (sem dimensão Serviço) e a célula vem do membro alocado.
const DIMS = [
  { id: "coord", label: "Coordenação" },
  { id: "projeto", label: "Projeto" },
  { id: "membro", label: "Membro" },
  { id: "cargo", label: "Cargo" },
  { id: "cliente", label: "Cliente" },
  { id: "celula", label: "Célula" },
  { id: "status", label: "Status" },
] as const;
const METRICS = [
  { id: "projetos", label: "Nº de projetos" },
  { id: "valor", label: "Valor (R$)" },
  { id: "membros", label: "Nº de membros" },
  { id: "registros", label: "Nº de vínculos" },
] as const;

function newCell(): Cell {
  return { proj: new Set(), mem: new Set(), valor: new Map(), count: 0 };
}
function addFact(cell: Cell, f: Fact) {
  cell.proj.add(f.projetoId);
  if (f.membroId !== null) cell.mem.add(f.membroId);
  cell.valor.set(f.projetoId, f.valor);
  cell.count++;
}

/**
 * Agrega fatos em matriz A × B mais células de união por linha/coluna.
 * Identidade por id (projeto/membro): nomes duplicados não se fundem e os
 * totais contam cada projeto uma única vez (sem somar o mesmo contrato N vezes).
 */
function aggregate(facts: Fact[], dimA: string, dimB: string, metric: string) {
  const matrix = new Map<string, Map<string, Cell>>();
  const rowCells = new Map<string, Cell>();
  const colCells = new Map<string, Cell>();
  facts.forEach((f) => {
    const a = f[dimA as keyof Fact] as string;
    const b = f[dimB as keyof Fact] as string;
    if (!matrix.has(a)) matrix.set(a, new Map());
    const row = matrix.get(a)!;
    if (!row.has(b)) row.set(b, newCell());
    addFact(row.get(b)!, f);
    if (!rowCells.has(a)) rowCells.set(a, newCell());
    addFact(rowCells.get(a)!, f);
    if (!colCells.has(b)) colCells.set(b, newCell());
    addFact(colCells.get(b)!, f);
  });
  const val = (cell?: Cell) => {
    if (!cell) return 0;
    if (metric === "projetos") return cell.proj.size;
    if (metric === "membros") return cell.mem.size;
    if (metric === "registros") return cell.count;
    if (metric === "valor") return [...cell.valor.values()].reduce((s, v) => s + v, 0);
    return 0;
  };
  return { matrix, rowCells, colCells, val };
}

export function AnalisesView({ facts: raw }: { facts: FactDTO[] }) {
  const facts = useMemo<Fact[]>(() => {
    // Há projetos distintos com o mesmo nome no banco; desambigua com o id.
    const idsPorNome = new Map<string, Set<number>>();
    raw.forEach((f) => {
      if (!idsPorNome.has(f.projeto)) idsPorNome.set(f.projeto, new Set());
      idsPorNome.get(f.projeto)!.add(f.projeto_id);
    });
    return raw.map((f) => ({
      projetoId: f.projeto_id,
      projeto: idsPorNome.get(f.projeto)!.size > 1 ? `${f.projeto} · #${f.projeto_id}` : f.projeto,
      valor: f.valor,
      membroId: f.membro_id,
      coord: f.coordenacao ?? "—",
      cliente: f.cliente ?? "—",
      cargo: f.cargo ?? "—",
      membro: f.membro ?? "—",
      celula: f.celula ?? "—",
      status: f.status ?? "—",
    }));
  }, [raw]);

  const [dimA, setDimA] = useState("coord");
  const [dimB, setDimB] = useState("membro");
  const [metric, setMetric] = useState("projetos");
  const [view, setView] = useState<"grafo" | "pivot" | "cards">("grafo");
  const [fCoord, setFCoord] = useState("todos");
  const [sel, setSel] = useState<{ side: "a" | "b"; i: number } | null>(null);

  // Seleção é por índice; mudar dimensão/métrica/filtro reordena os nós.
  const pick = (set: (v: string) => void) => (v: string) => {
    set(v);
    setSel(null);
  };

  const coordOptions = useMemo(
    () => ["todos", ...[...new Set(facts.map((f) => f.coord))].filter((c) => c !== "—").sort()],
    [facts],
  );

  const filtered = facts.filter((f) => fCoord === "todos" || f.coord === fCoord);

  const dimAmeta = DIMS.find((d) => d.id === dimA)!;
  const dimBmeta = DIMS.find((d) => d.id === dimB)!;
  const metricMeta = METRICS.find((x) => x.id === metric)!;
  const fmt = (v: number) => (metric === "valor" ? BRL(v) : String(v));

  const agg = aggregate(filtered, dimA, dimB, metric);
  const val = agg.val;
  const aTotals: ARow[] = [...agg.matrix.entries()]
    .map(([a, row]) => ({ a, total: val(agg.rowCells.get(a)), row }))
    .filter((x) => x.a !== "—")
    .sort((x, y) => y.total - x.total);
  const bTotals = [...agg.colCells.entries()]
    .filter(([b]) => b !== "—")
    .map(([b, cell]) => ({ b, t: val(cell) }))
    .sort((x, y) => y.t - x.t);

  return (
    <div className="mx-auto max-w-[1480px]">
      <header className="mb-6">
        <p className="eyebrow text-meta-blue text-xs md:text-sm">Inteligência · BDU</p>
        <h1 className="mt-1 text-2xl md:text-3xl font-bold text-foreground">Análises Transversais</h1>
        <p className="mt-2 max-w-2xl text-sm md:text-base leading-relaxed text-muted-foreground">
          O espaço para cruzar livremente as dimensões da empresa. Escolha o que conectar, aplique filtros e
          leia a relação como grafo, tabela cruzada ou comparação. Sem dashboards fixos.
        </p>
      </header>

      <div className="card card--pad mb-4 md:mb-6" style={{ background: "linear-gradient(180deg,#fff,#fbfcff)" }}>
        <div className="flex flex-col gap-4 md:gap-0 md:flex-wrap md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
            <span className="eyebrow-mini flex items-center gap-1.5 text-xs md:text-sm"><Icon name="sliders" size={13} />Construtor</span>
            <div className="flex flex-wrap items-center gap-2 md:gap-1">
              <span className="badge badge--info text-xs">A</span>
              <MetaSelect value={dimA} onChange={pick(setDimA)} options={DIMS.filter((d) => d.id !== dimB).map((d) => [d.id, d.label] as [string, string])} />
              <span className="flowarrow hidden md:inline"><Icon name="arrowRight" size={18} /></span>
              <span className="badge badge--neutral text-xs">B</span>
              <MetaSelect value={dimB} onChange={pick(setDimB)} options={DIMS.filter((d) => d.id !== dimA).map((d) => [d.id, d.label] as [string, string])} />
              <span style={{ width: 1, height: 26, background: "var(--meta-navy-10)", margin: "0 4px" }} className="hidden md:inline-block" />
              <span className="eyebrow-mini text-xs md:text-sm">Métrica</span>
              <MetaSelect value={metric} onChange={pick(setMetric)} options={METRICS.map((x) => [x.id, x.label] as [string, string])} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            <span className="eyebrow-mini flex items-center gap-1.5 text-xs md:text-sm"><Icon name="filter" size={12} />Filtro</span>
            <MetaSelect value={fCoord} onChange={pick(setFCoord)} options={coordOptions.map((c) => [c, c === "todos" ? "Toda coord." : c] as [string, string])} />
          </div>
        </div>
        <div className="mt-4 md:mt-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-2 border-t border-meta-navy-10 pt-4 md:pt-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs md:text-[13px] text-meta-navy-50">Lendo</span>
            <span className="epill e-coord" style={{ cursor: "default" }}><span className="epill__dot" /><span className="text-xs md:text-sm">{dimAmeta.label}</span></span>
            <Icon name="arrowRight" size={14} className="text-meta-navy-30" />
            <span className="epill e-servico" style={{ cursor: "default" }}><span className="epill__dot" /><span className="text-xs md:text-sm">{dimBmeta.label}</span></span>
            <span className="text-xs md:text-[13px] text-meta-navy-50">por</span>
            <span className="badge badge--info text-xs">{metricMeta.label}</span>
          </div>
          <div className="seg">
            <div className={"seg__opt" + (view === "grafo" ? " active" : "")} onClick={() => setView("grafo")}><Icon name="network" size={15} />Grafo</div>
            <div className={"seg__opt" + (view === "pivot" ? " active" : "")} onClick={() => setView("pivot")}><Icon name="table" size={15} />Pivot</div>
            <div className={"seg__opt" + (view === "cards" ? " active" : "")} onClick={() => setView("cards")}><Icon name="grid" size={15} />Comparar</div>
          </div>
        </div>
      </div>

      {view === "grafo" && <GraphView aTotals={aTotals} bTotals={bTotals} val={val} dimAmeta={dimAmeta} dimBmeta={dimBmeta} fmt={fmt} sel={sel} setSel={setSel} />}
      {view === "pivot" && <PivotView aTotals={aTotals} bTotals={bTotals} val={val} fmt={fmt} dimAmeta={dimAmeta} dimBmeta={dimBmeta} />}
      {view === "cards" && <CompareView aTotals={aTotals} val={val} fmt={fmt} dimBmeta={dimBmeta} metricMeta={metricMeta} />}

      <SectionTitle icon="spark">Leituras que o cruzamento revela</SectionTitle>
      <ResponsiveGrid cols="4-8-12" gap="md">
        {[
          { ico: "branch", t: "Coordenação que mais entrega", d: "Coordenação × Projeto, por nº de projetos.", a: "coord", b: "projeto", m: "projetos" },
          { ico: "projects", t: "Projeto que mais conecta", d: "Projeto × Membro, por nº de membros.", a: "projeto", b: "membro", m: "membros" },
          { ico: "building", t: "Cliente → receita", d: "Cliente × Projeto, por valor contratado.", a: "cliente", b: "projeto", m: "valor" },
        ].map((c, i) => (
          <div
            key={i}
            className="col-span-4 md:col-span-4 lg:col-span-4 card card--pad flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ cursor: "pointer" }}
            onClick={() => { setDimA(c.a); setDimB(c.b); setMetric(c.m); setSel(null); }}
          >
            <span className="kpi__ico shrink-0" style={{ width: 38, height: 38 }}><Icon name={c.ico} size={18} /></span>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{c.t}</div>
              <div className="muted mt-0.5 text-[11px] sm:text-[12.5px] leading-snug text-meta-navy-50">{c.d}</div>
            </div>
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  );
}

type DimMeta = { id: string; label: string };

interface GraphNode {
  id: string;
  label: string;
  side: "a" | "b";
  value: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphEdge {
  source: string;
  target: string;
  value: number;
}

function GraphView({ aTotals, bTotals, val, dimAmeta, dimBmeta, fmt, sel, setSel }: { aTotals: ARow[]; bTotals: { b: string; t: number }[]; val: (c?: Cell) => number; dimAmeta: DimMeta; dimBmeta: DimMeta; fmt: (v: number) => string; sel: { side: "a" | "b"; i: number } | null; setSel: (s: { side: "a" | "b"; i: number } | null) => void; }) {
  const [limitMode, setLimitMode] = useState<"top8" | "top15" | "all">("all");
  const [isSimulating, setIsSimulating] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [simTrigger, setSimTrigger] = useState(0);

  const W = 1000;
  const H = 600;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggedNodeIdRef = useRef<string | null>(null);
  const isDraggingNode = useRef(false);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Slices based on limitMode
  const A = useMemo(() => {
    return limitMode === "top8"
      ? aTotals.slice(0, 8)
      : limitMode === "top15"
      ? aTotals.slice(0, 15)
      : aTotals;
  }, [aTotals, limitMode]);

  const B = useMemo(() => {
    return limitMode === "top8"
      ? bTotals.slice(0, 8)
      : limitMode === "top15"
      ? bTotals.slice(0, 15)
      : bTotals;
  }, [bTotals, limitMode]);

  const maxT = useMemo(() => Math.max(...A.map((x) => x.total), 1), [A]);
  const maxB = useMemo(() => Math.max(...B.map((x) => x.t), 1), [B]);

  // Generate edges list
  const edges = useMemo<GraphEdge[]>(() => {
    const list: GraphEdge[] = [];
    A.forEach((a) => {
      B.forEach((b) => {
        const v = val(a.row.get(b.b));
        if (v > 0) {
          list.push({
            source: `a-${a.a}`,
            target: `b-${b.b}`,
            value: v,
          });
        }
      });
    });
    return list;
  }, [A, B, val]);

  const maxE = useMemo(() => Math.max(...edges.map((e) => e.value), 1), [edges]);

  // Initialize nodes state and keep coordinates if they already exist
  const [nodes, setNodes] = useState<GraphNode[]>([]);

  useEffect(() => {
    setNodes((prevNodes) => {
      const nextNodes: GraphNode[] = [];
      const nodeMap = new Map(prevNodes.map((n) => [n.id, n]));

      // A nodes (left)
      A.forEach((a, i) => {
        const id = `a-${a.a}`;
        const existing = nodeMap.get(id);
        const radius = 14 + (a.total / maxT) * 12;
        nextNodes.push({
          id,
          label: a.a,
          side: "a",
          value: a.total,
          x: existing ? existing.x : 250 + (Math.random() - 0.5) * 20,
          y: existing
            ? existing.y
            : 80 + i * ((H - 160) / Math.max(A.length - 1, 1 || 1)),
          vx: existing ? existing.vx : 0,
          vy: existing ? existing.vy : 0,
          r: radius,
          fx: existing ? existing.fx : null,
          fy: existing ? existing.fy : null,
        });
      });

      // B nodes (right)
      B.forEach((b, i) => {
        const id = `b-${b.b}`;
        const existing = nodeMap.get(id);
        const radius = 12 + (b.t / maxB) * 10;
        nextNodes.push({
          id,
          label: b.b,
          side: "b",
          value: b.t,
          x: existing ? existing.x : 750 + (Math.random() - 0.5) * 20,
          y: existing
            ? existing.y
            : 80 + i * ((H - 160) / Math.max(B.length - 1, 1 || 1)),
          vx: existing ? existing.vx : 0,
          vy: existing ? existing.vy : 0,
          r: radius,
          fx: existing ? existing.fx : null,
          fy: existing ? existing.fy : null,
        });
      });

      return nextNodes;
    });
    
    // Reheat simulation on data changes
    alphaRef.current = 1;
    setSimTrigger((prev) => prev + 1);
  }, [A, B, maxT, maxB]);

  // Refs for the simulation loop
  const nodesRef = useRef<GraphNode[]>([]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const edgesRef = useRef<GraphEdge[]>([]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const alphaRef = useRef(1);
  const decay = 0.975;

  const reheat = () => {
    alphaRef.current = 1.0;
    setSimTrigger((prev) => prev + 1);
  };

  // Force layout simulation loop
  useEffect(() => {
    if (!isSimulating) return;

    let animId: number;

    const tick = () => {
      if (alphaRef.current < 0.005) {
        // Simulation cooled down
        return;
      }

      const currentNodes = [...nodesRef.current];
      const currentEdges = edgesRef.current;
      const dragId = draggedNodeIdRef.current;
      const alpha = alphaRef.current;

      const nodeMap = new Map(currentNodes.map((n) => [n.id, n]));

      // Charge force (repulsion)
      for (let i = 0; i < currentNodes.length; i++) {
        const n1 = currentNodes[i];
        for (let j = i + 1; j < currentNodes.length; j++) {
          const n2 = currentNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          // Repulsion strength
          const strength = (n1.r + n2.r) * 35 * alpha;
          const force = strength / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (n1.id !== dragId && n1.fx === null) {
            n1.vx -= fx;
            n1.vy -= fy;
          }
          if (n2.id !== dragId && n2.fx === null) {
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // Link force (attraction)
      currentEdges.forEach((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode || !targetNode) return;

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Ideal distance between connected nodes
        const desiredDist = 130;
        const k = 0.045 * alpha;
        const force = (dist - desiredDist) * k;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (sourceNode.id !== dragId && sourceNode.fx === null) {
          sourceNode.vx += fx;
          sourceNode.vy += fy;
        }
        if (targetNode.id !== dragId && targetNode.fx === null) {
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      });

      // Gravity / centering
      const cx = W / 2;
      const cy = H / 2;
      currentNodes.forEach((node) => {
        if (node.id === dragId) return;

        if (node.fx !== null && node.fx !== undefined) {
          node.x = node.fx;
          node.y = node.fy!;
          node.vx = 0;
          node.vy = 0;
          return;
        }

        // Pull to center
        const dx = cx - node.x;
        const dy = cy - node.y;
        node.vx += dx * 0.006 * alpha;
        node.vy += dy * 0.006 * alpha;

        // Apply velocity and damping
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.82;
        node.vy *= 0.82;

        // Boundaries
        node.x = Math.max(node.r + 15, Math.min(W - node.r - 15, node.x));
        node.y = Math.max(node.r + 15, Math.min(H - node.r - 15, node.y));
      });

      nodesRef.current = currentNodes;
      setNodes(currentNodes);

      // Decay alpha
      alphaRef.current = alpha * decay;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, edges, simTrigger]);

  // Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<SVGElement>, nodeId?: string) => {
    if (nodeId) {
      // Node drag start
      draggedNodeIdRef.current = nodeId;
      isDraggingNode.current = true;
      dragStartPos.current = { x: e.clientX, y: e.clientY };

      const clickedNode = nodes.find((n) => n.id === nodeId);
      if (clickedNode) {
        clickedNode.fx = clickedNode.x;
        clickedNode.fy = clickedNode.y;
      }
      reheat();
    } else {
      // Background pan start
      isPanning.current = true;
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isDraggingNode.current && draggedNodeIdRef.current) {
      // Calculate mouse position in SVG coordinates
      const svgX = (mx - pan.x) / zoom;
      const svgY = (my - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === draggedNodeIdRef.current) {
            return { ...n, x: svgX, y: svgY, fx: svgX, fy: svgY, vx: 0, vy: 0 };
          }
          return n;
        })
      );
      reheat();
    } else if (isPanning.current) {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingNode.current && draggedNodeIdRef.current) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 4) {
        // It's a click, toggle selection
        const id = draggedNodeIdRef.current;
        setSelectedNodeId((prev) => (prev === id ? null : id));
      } else {
        // Unpin on release
        const id = draggedNodeIdRef.current;
        setNodes((prev) =>
          prev.map((n) => {
            if (n.id === id) {
              return { ...n, fx: null, fy: null };
            }
            return n;
          })
        );
      }
    }
    isDraggingNode.current = false;
    draggedNodeIdRef.current = null;
    isPanning.current = false;
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    const nextZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const clampedZoom = Math.max(0.25, Math.min(nextZoom, 4));

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const newPanX = mx - ((mx - pan.x) * clampedZoom) / zoom;
      const newPanY = my - ((my - pan.y) * clampedZoom) / zoom;

      setZoom(clampedZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  };

  const releaseAllNodes = () => {
    setNodes((prev) => prev.map((n) => ({ ...n, fx: null, fy: null })));
    reheat();
  };

  const zoomIn = () => setZoom((z) => Math.min(z * 1.25, 4));
  const zoomOut = () => setZoom((z) => Math.max(z / 1.25, 0.25));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Highlight and connection filter logic
  const focusId = hoveredNodeId || selectedNodeId;

  // Set of node ids matching search query
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery) return new Set<string>();
    const q = searchQuery.toLowerCase();
    return new Set(
      nodes.filter((n) => n.label.toLowerCase().includes(q)).map((n) => n.id)
    );
  }, [nodes, searchQuery]);

  // Set of active/highlighted node ids
  const activeNodeIds = useMemo(() => {
    const active = new Set<string>();

    if (matchingNodeIds.size > 0) {
      // Highlight matching nodes and their neighbors
      matchingNodeIds.forEach((id) => {
        active.add(id);
        edges.forEach((e) => {
          if (e.source === id) active.add(e.target);
          if (e.target === id) active.add(e.source);
        });
      });
      return active;
    }

    if (!focusId) return null; // All active

    active.add(focusId);
    edges.forEach((e) => {
      if (e.source === focusId) active.add(e.target);
      if (e.target === focusId) active.add(e.source);
    });

    return active;
  }, [focusId, edges, matchingNodeIds]);

  const isNodeActive = (nodeId: string) => {
    if (activeNodeIds === null) return true;
    return activeNodeIds.has(nodeId);
  };

  const isEdgeActive = (edge: GraphEdge) => {
    if (matchingNodeIds.size > 0) {
      return matchingNodeIds.has(edge.source) || matchingNodeIds.has(edge.target);
    }
    if (!focusId) return true;
    return edge.source === focusId || edge.target === focusId;
  };

  // Shorten label for cleaner view
  const shorten = (s: string) => (s.length > 20 ? s.slice(0, 18) + "…" : s);

  return (
    <Card pad={false} className="relative mb-6 overflow-hidden select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-meta-navy-10 px-[18px] py-3 gap-3">
        <div>
          <div className="card__title">Grafo de relações</div>
          <div className="card__sub">
            Clique e arraste um nó para organizar. Use o scroll do mouse para zoom e arraste o fundo para mover.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Data limit selector */}
          <div className="flex items-center gap-1 bg-meta-navy-5 p-0.5 rounded-lg border border-meta-navy-10">
            <button
              onClick={() => setLimitMode("top8")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                limitMode === "top8"
                  ? "bg-white text-meta-navy shadow-sm"
                  : "text-meta-navy-50 hover:text-meta-navy"
              }`}
            >
              Top 8
            </button>
            <button
              onClick={() => setLimitMode("top15")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                limitMode === "top15"
                  ? "bg-white text-meta-navy shadow-sm"
                  : "text-meta-navy-50 hover:text-meta-navy"
              }`}
            >
              Top 15
            </button>
            <button
              onClick={() => setLimitMode("all")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                limitMode === "all"
                  ? "bg-white text-meta-navy shadow-sm"
                  : "text-meta-navy-50 hover:text-meta-navy"
              }`}
            >
              Todos ({aTotals.length + bTotals.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar no mapa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs px-2.5 py-1.5 pr-6 border border-meta-navy-10 rounded-lg bg-white focus:outline-none focus:border-meta-blue w-36 sm:w-44 transition-all focus:w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1.5 text-meta-navy-40 hover:text-meta-navy text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {selectedNodeId && (
            <button
              className="card__action text-xs"
              onClick={() => setSelectedNodeId(null)}
            >
              Limpar foco
            </button>
          )}
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="grid h-[380px] place-items-center px-6 text-center text-[13px] text-meta-navy-50">
          Sem dados para este cruzamento no recorte atual. Ajuste as dimensões ou o filtro.
        </div>
      ) : (
        <div className="relative overflow-hidden w-full h-[600px] bg-slate-50/20">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${W} ${H}`}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ display: "block", cursor: isPanning.current ? "grabbing" : "grab" }}
          >
            {/* Legend inside SVG */}
            <g transform="translate(20, 25)" style={{ pointerEvents: "none" }}>
              <text
                x={0}
                y={0}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  fill: "#0067FF",
                  fontFamily: "Poppins",
                }}
              >
                ● {dimAmeta.label.toUpperCase()}
              </text>
              <text
                x={0}
                y={18}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  fill: "#E5484D",
                  fontFamily: "Poppins",
                }}
              >
                ● {dimBmeta.label.toUpperCase()}
              </text>
            </g>

            {/* Main Transform Group for Pan and Zoom */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              <g className="edges-group">
                {edges.map((e, i) => {
                  const sourceNode = nodes.find((n) => n.id === e.source);
                  const targetNode = nodes.find((n) => n.id === e.target);
                  if (!sourceNode || !targetNode) return null;

                  const active = isEdgeActive(e);
                  return (
                    <line
                      key={i}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={active ? "#0067FF" : "#c9d1e6"}
                      strokeWidth={active ? 1.5 + (e.value / maxE) * 6 : 1}
                      strokeOpacity={active ? 0.6 : 0.08}
                      style={{ transition: "stroke-opacity 0.2s, stroke-width 0.2s" }}
                    />
                  );
                })}
              </g>

              {/* Nodes */}
              <g className="nodes-group">
                {nodes.map((node) => {
                  const active = isNodeActive(node.id);
                  const isHovered = hoveredNodeId === node.id;
                  const isSelected = selectedNodeId === node.id;
                  const queryMatch = matchingNodeIds.has(node.id);

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, node.id);
                      }}
                      opacity={active ? 1 : 0.2}
                    >
                      {/* Outer ring for highlight / hover */}
                      <circle
                        cx={0}
                        cy={0}
                        r={node.r + (isHovered || isSelected || queryMatch ? 5 : 0)}
                        fill="none"
                        stroke={node.side === "a" ? "#0067FF" : "#E5484D"}
                        strokeWidth={isHovered || isSelected || queryMatch ? 2.5 : 0}
                        strokeOpacity={0.6}
                        style={{ transition: "r 0.15s, stroke-width 0.15s" }}
                      />

                      {/* Main Node Circle */}
                      <circle
                        cx={0}
                        cy={0}
                        r={node.r}
                        fill={node.side === "a" ? "#0067FF" : "#E5484D"}
                        className="shadow-sm"
                      />

                      {/* Value inside circle (only Side A if it fits) */}
                      {node.side === "a" && node.r > 15 && (
                        <text
                          x={0}
                          y={4}
                          textAnchor="middle"
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            fill: "#fff",
                            fontFamily: "Poppins",
                            pointerEvents: "none",
                          }}
                        >
                          {fmt(node.value).replace("R$ ", "")}
                        </text>
                      )}

                      {/* Node Label (Text above) */}
                      <text
                        x={0}
                        y={-node.r - 6}
                        textAnchor="middle"
                        style={{
                          fontSize: 11,
                          fontWeight: isSelected || isHovered || queryMatch ? 700 : 500,
                          fill: isSelected || isHovered || queryMatch ? "#0a4fc0" : "#131936",
                          fontFamily: "Inter",
                          pointerEvents: "none",
                          paintOrder: "stroke",
                          stroke: "#fff",
                          strokeWidth: 3,
                          strokeLinejoin: "round",
                        }}
                      >
                        {shorten(node.label)}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>

          {/* Floating HUD controls */}
          <div className="absolute bottom-4 right-4 flex flex-col sm:flex-row items-center gap-2 bg-white/90 backdrop-blur-sm border border-meta-navy-10 p-2 rounded-xl shadow-md z-10">
            <div className="flex items-center gap-1">
              <button
                onClick={zoomIn}
                title="Aumentar Zoom"
                className="w-8 h-8 flex items-center justify-center border border-meta-navy-10 rounded-lg hover:bg-meta-navy-5 text-meta-navy font-bold text-sm transition-colors cursor-pointer"
              >
                +
              </button>
              <button
                onClick={zoomOut}
                title="Diminuir Zoom"
                className="w-8 h-8 flex items-center justify-center border border-meta-navy-10 rounded-lg hover:bg-meta-navy-5 text-meta-navy font-bold text-sm transition-colors cursor-pointer"
              >
                -
              </button>
              <button
                onClick={resetView}
                title="Centralizar Mapa"
                className="px-2 h-8 flex items-center gap-1.5 border border-meta-navy-10 rounded-lg hover:bg-meta-navy-5 text-meta-navy text-xs font-semibold transition-colors cursor-pointer"
              >
                <Icon name="home" size={12} /> Centralizar
              </button>
            </div>
            <div className="hidden sm:block w-[1px] h-6 bg-meta-navy-10" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                title={isSimulating ? "Pausar Física" : "Iniciar Física"}
                className={`px-2.5 h-8 flex items-center gap-1.5 border border-meta-navy-10 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isSimulating
                    ? "bg-meta-blue/10 border-meta-blue/30 text-meta-blue"
                    : "hover:bg-meta-navy-5 text-meta-navy"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSimulating ? "bg-meta-blue animate-pulse" : "bg-meta-navy-30"
                  }`}
                />
                {isSimulating ? "Física Ativa" : "Física Pausada"}
              </button>
              <button
                onClick={releaseAllNodes}
                title="Liberar todos os nós para flutuar"
                className="px-2.5 h-8 flex items-center justify-center border border-meta-navy-10 rounded-lg hover:bg-meta-navy-5 text-meta-navy text-xs font-semibold transition-colors cursor-pointer"
              >
                Soltar Nós
              </button>
            </div>
          </div>

          {/* Helper tip in bottom-left */}
          <div className="absolute bottom-4 left-4 text-[11px] text-meta-navy-45 bg-white/75 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-meta-navy-10 pointer-events-none hidden md:block">
            💡 Dica: Role scroll para zoom · Arraste o fundo para mover · Arraste nós para organizar
          </div>
        </div>
      )}
    </Card>
  );
}

function PivotView({ aTotals, bTotals, val, fmt, dimAmeta, dimBmeta }: { aTotals: ARow[]; bTotals: { b: string; t: number }[]; val: (c?: Cell) => number; fmt: (v: number) => string; dimAmeta: DimMeta; dimBmeta: DimMeta; }) {
  const B = bTotals.slice(0, 8);
  const allVals = aTotals.flatMap((a) => B.map((b) => val(a.row.get(b.b))));
  const max = Math.max(...allVals, 1);
  return (
    <Card pad={false} className="mb-6">
      <div className="border-b border-meta-navy-10 px-4 md:px-[18px] py-3 md:py-3.5">
        <div className="card__title text-sm md:text-base">Tabela cruzada — {dimAmeta.label} × {dimBmeta.label}</div>
        <div className="card__sub text-xs md:text-sm">Quanto mais escura a célula, maior o valor. Total da linha conta cada projeto uma única vez.</div>
      </div>
      <AdaptiveTable>
        <thead>
          <tr>
            <th style={{ minWidth: 120 }} className="text-xs md:text-sm">{dimAmeta.label}</th>
            {B.map((b) => <th key={b.b} className="text-center text-xs md:text-sm min-w-12">{b.b.length > 14 ? b.b.slice(0, 13) + "…" : b.b}</th>)}
            <th className="num text-xs md:text-sm min-w-16">Total</th>
          </tr>
        </thead>
        <tbody>
          {aTotals.map((a) => (
            <tr key={a.a}>
              <td className="font-semibold text-xs md:text-sm" style={{ fontFamily: "var(--font-heading)" }}>{a.a}</td>
              {B.map((b) => {
                const v = val(a.row.get(b.b));
                return (
                  <td key={b.b} className="text-center p-1 md:p-1.5">
                    <div className="mx-auto grid place-items-center text-xs font-bold p-1 md:p-1.5 rounded" style={{ minWidth: 36, minHeight: 28, fontFamily: "var(--font-heading)", background: v ? `rgba(0,103,255,${0.07 + (0.55 * v) / max})` : "var(--meta-paper)", color: v > max * 0.55 ? "#fff" : "var(--meta-navy)" }}>{v ? fmt(v).replace("R$ ", "") : ""}</div>
                  </td>
                );
              })}
              <td className="num text-xs md:text-sm whitespace-nowrap">{fmt(a.total)}</td>
            </tr>
          ))}
        </tbody>
      </AdaptiveTable>
    </Card>
  );
}

function CompareView({ aTotals, val, fmt, dimBmeta, metricMeta }: { aTotals: ARow[]; val: (c?: Cell) => number; fmt: (v: number) => string; dimBmeta: DimMeta; metricMeta: { id: string; label: string }; }) {
  const max = Math.max(...aTotals.map((a) => a.total), 1);
  return (
    <div className="grid-mvp cols-3 mb-6">
      {aTotals.map((a) => {
        const tops = [...a.row.entries()].map(([b, cell]) => ({ b, v: val(cell) })).filter((x) => x.b !== "—" && x.v > 0).sort((x, y) => y.v - x.v).slice(0, 3);
        return (
          <div key={a.a} className="card card--pad">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{a.a}</div>
              <div className="text-meta-gradient text-xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{fmt(a.total)}</div>
            </div>
            <div className="muted mb-2.5 text-[11.5px] text-meta-navy-50">{metricMeta.label.toLowerCase()}</div>
            <Bar value={(a.total / max) * 100} />
            <div className="mt-3.5">
              <div className="eyebrow-mini mb-2">Principais {dimBmeta.label.toLowerCase()}s</div>
              <div className="flex flex-wrap gap-1.5">
                {tops.length ? tops.map((t, i) => (
                  <span key={i} className="tag" style={{ padding: "3px 9px" }}>{t.b.length > 16 ? t.b.slice(0, 15) + "…" : t.b} · <b>{fmt(t.v).replace("R$ ", "")}</b></span>
                )) : <span className="muted text-xs text-meta-navy-50">—</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
