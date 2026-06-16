"use client";

import { useMemo, useState } from "react";
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
      <ResponsiveGrid cols={{ mobile: 4, tablet: 8, desktop: 12 }} gap="md">
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

function GraphView({ aTotals, bTotals, val, dimAmeta, dimBmeta, fmt, sel, setSel }: { aTotals: ARow[]; bTotals: { b: string; t: number }[]; val: (c?: Cell) => number; dimAmeta: DimMeta; dimBmeta: DimMeta; fmt: (v: number) => string; sel: { side: "a" | "b"; i: number } | null; setSel: (s: { side: "a" | "b"; i: number } | null) => void; }) {
  const A = aTotals.slice(0, 8);
  const B = bTotals.slice(0, 8);
  const W = 900;
  const H = Math.max(380, Math.max(A.length, B.length) * 52 + 40);
  const ax = 240;
  const bx = W - 240;
  const hiddenA = aTotals.length - A.length;
  const hiddenB = bTotals.length - B.length;
  const ay = (i: number) => 40 + i * ((H - 80) / Math.max(A.length - 1, 1));
  const by = (i: number) => 40 + i * ((H - 80) / Math.max(B.length - 1, 1));
  const maxT = Math.max(...A.map((x) => x.total), 1);
  const maxB = Math.max(...B.map((x) => x.t), 1);
  const edges: { ai: number; bi: number; v: number }[] = [];
  A.forEach((a, ai) => B.forEach((b, bi) => { const v = val(a.row.get(b.b)); if (v > 0) edges.push({ ai, bi, v }); }));
  const maxE = Math.max(...edges.map((e) => e.v), 1);
  const isActive = (side: "a" | "b", i: number) =>
    !sel || (sel.side === side && sel.i === i) ||
    (sel.side === "a" && side === "b" && edges.some((e) => e.ai === sel.i && e.bi === i)) ||
    (sel.side === "b" && side === "a" && edges.some((e) => e.bi === sel.i && e.ai === i));
  const edgeActive = (e: { ai: number; bi: number }) => !sel || (sel.side === "a" && e.ai === sel.i) || (sel.side === "b" && e.bi === sel.i);

  return (
    <Card pad={false} className="mb-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-meta-navy-10 px-[18px] py-3.5">
        <div>
          <div className="card__title">Grafo de relações</div>
          <div className="card__sub">
            Clique num nó para isolar suas conexões. Espessura da linha = intensidade.
            {(hiddenA > 0 || hiddenB > 0) && (
              <span className="ml-1 text-meta-navy-30">
                · mostrando top {A.length}
                {hiddenA > 0 ? ` de ${A.length + hiddenA}` : ""} × top {B.length}
                {hiddenB > 0 ? ` de ${B.length + hiddenB}` : ""}
              </span>
            )}
          </div>
        </div>
        {sel && <button className="card__action" onClick={() => setSel(null)}>Limpar seleção</button>}
      </div>
      {A.length === 0 ? (
        <div className="grid h-[260px] place-items-center px-6 text-center text-[13px] text-meta-navy-50">
          Sem dados para este cruzamento no recorte atual. Ajuste as dimensões ou o filtro.
        </div>
      ) : (
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 680, display: "block" }}>
          <text x={ax} y={22} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: "#0a4fc0", fontFamily: "Poppins" }}>{dimAmeta.label.toUpperCase()}</text>
          <text x={bx} y={22} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: "#c43338", fontFamily: "Poppins" }}>{dimBmeta.label.toUpperCase()}</text>
          {edges.map((e, i) => (
            <path key={i} d={`M ${ax + 12} ${ay(e.ai)} C ${(ax + bx) / 2} ${ay(e.ai)}, ${(ax + bx) / 2} ${by(e.bi)}, ${bx - 12} ${by(e.bi)}`} fill="none" stroke={edgeActive(e) ? "#0067FF" : "#c9d1e6"} strokeWidth={1 + (e.v / maxE) * 5} strokeOpacity={edgeActive(e) ? 0.55 : 0.18} />
          ))}
          {A.map((a, i) => {
            const r = 12 + (a.total / maxT) * 12;
            const act = isActive("a", i);
            return (
              <g key={"a" + i} style={{ cursor: "pointer" }} opacity={act ? 1 : 0.32} onClick={() => setSel(sel && sel.side === "a" && sel.i === i ? null : { side: "a", i })}>
                <circle cx={ax} cy={ay(i)} r={r} fill="#0067FF" />
                <text x={ax - r - 8} y={ay(i) + 4} textAnchor="end" style={{ fontSize: 12.5, fontWeight: 600, fill: "#131936", fontFamily: "Inter" }}>{a.a.length > 20 ? a.a.slice(0, 19) + "…" : a.a}</text>
                <text x={ax} y={ay(i) + 4} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: "#fff", fontFamily: "Poppins" }}>{fmt(a.total).replace("R$ ", "")}</text>
              </g>
            );
          })}
          {B.map((b, i) => {
            const r = 12 + (b.t / maxB) * 10;
            const act = isActive("b", i);
            return (
              <g key={"b" + i} style={{ cursor: "pointer" }} opacity={act ? 1 : 0.32} onClick={() => setSel(sel && sel.side === "b" && sel.i === i ? null : { side: "b", i })}>
                <circle cx={bx} cy={by(i)} r={r} fill="#E5484D" />
                <text x={bx + r + 8} y={by(i) + 4} textAnchor="start" style={{ fontSize: 12.5, fontWeight: 600, fill: "#131936", fontFamily: "Inter" }}>{b.b.length > 20 ? b.b.slice(0, 19) + "…" : b.b}</text>
              </g>
            );
          })}
        </svg>
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
