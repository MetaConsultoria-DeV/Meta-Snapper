"use client";

import { useState } from "react";
import { BRL } from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";
import { Kpi, Card, AvatarStack, PlaceholderNote, EntityPill, FlowChain, StatusBadge } from "@/components/dashboard/primitives";
import { MetaSelect } from "@/components/dashboard/meta-select";
import { Icon } from "@/components/dashboard/icon";

/**
 * Represents a project item from the backend API database.
 * @typedef {Object} ProjetoVM
 * @property {number} id - The unique identifier of the project.
 * @property {string} nome - The name of the project.
 * @property {number} valor - The monetary value of the project contract.
 * @property {string} coord - The full name of the technical coordination team.
 * @property {string} coordSigla - The acronym of the technical coordination.
 * @property {string | null} cliente - The name of the client associated with the project.
 * @property {string[]} equipe - The list of members allocated to the project team.
 * @property {("ativo" | "concluido" | "pausado")} [status] - The optional execution status of the project.
 * @property {string | null} [descricao] - The optional description containing status keywords.
 */
export type ProjetoVM = {
  id: number;
  nome: string;
  valor: number;
  coord: string;
  coordSigla: string;
  cliente: string | null;
  equipe: string[];
  status?: "ativo" | "concluido" | "pausado";
  descricao?: string | null;
};

/**
 * Represents a project object containing a guaranteed status field.
 * @typedef {Omit<ProjetoVM, "status"> & { status: "ativo" | "concluido" | "pausado" }} ProjetoWithStatus
 */
export type ProjetoWithStatus = Omit<ProjetoVM, "status"> & { status: "ativo" | "concluido" | "pausado" };

/**
 * Technical coordination color scheme palette mapping.
 * @type {Record<string, string>}
 */
const CORD_COR: Record<string, string> = { TD: "#7C4DFF", GN: "#0067FF", OP: "#00B894", DM: "#F5A623", CE: "#E5484D" };

/**
 * Utility helper returning coordination theme color by acronym.
 * Falls back to a default neutral color.
 *
 * @function cor
 * @param {string} s - Technical coordination acronym.
 * @returns {string} Hex color string.
 */
const cor = (s: string) => CORD_COR[s] ?? "#6B7299";

/**
 * EntityDrawer Component
 * Renders a slide-out drawer panel from the right displaying detailed project metadata.
 * Displays project identity, a horizontal relation chain (Client -> Project -> Contract),
 * description, team roster list, and contract details.
 * Features backdrop fade animation and translation transitions.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {ProjetoWithStatus | null} props.project - The selected project data or null if closed.
 * @param {function} props.onClose - Callback triggered when backdrop or close button is clicked.
 */
function EntityDrawer({ project, onClose }: { project: ProjetoWithStatus | null; onClose: () => void }) {
  const isOpen = project !== null;
  const contractId = project ? `CT-${String(project.id).padStart(3, "0")}` : "";

  // Build the horizontal relational steps: Client -> Project -> Contract
  const chainSteps = [];
  if (project) {
    if (project.cliente) {
      chainSteps.push({ type: "cliente", label: project.cliente });
    }
    chainSteps.push({ type: "projeto", label: project.nome });
    if (project.valor > 0) {
      chainSteps.push({ type: "contrato", label: contractId });
    }
  }

  return (
    <>
      {/* Drawer Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-meta-navy/40 backdrop-blur-[2px] transition-opacity duration-300 z-[100] ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[420px] max-w-[92vw] bg-white shadow-2xl z-[110] transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {project && (
          <>
            {/* Header section with brand accent corner image */}
            <div className="bg-meta-navy text-white p-6 relative overflow-hidden flex-shrink-0">
              <div
                className="absolute inset-0 bg-no-repeat bg-right-top opacity-[0.15]"
                style={{
                  backgroundImage: "url('/brand/network-corner.png')",
                  backgroundSize: "200px",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-meta-blue-light text-[11px] font-semibold tracking-wider uppercase">
                    Projeto
                  </span>
                  {/* Close button - rotates plus icon by 45 degrees to represent an X */}
                  <button
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border-none text-white cursor-pointer"
                    onClick={onClose}
                  >
                    <Icon name="plus" className="rotate-45" size={16} />
                  </button>
                </div>
                <h3 className="text-2xl font-bold mt-3 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  {project.nome}
                </h3>
                <p className="text-meta-navy-30 text-[13px] mt-1 font-medium">
                  {project.status === "ativo" ? "Em execução" : project.status === "concluido" ? "Concluído" : "Pausado"} · {project.coord}
                </p>
                {/* Meta details pills row */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="text-[11.5px] font-semibold bg-white/10 px-2.5 py-1 rounded-full text-white">
                    {project.status === "ativo" ? "Em execução" : project.status === "concluido" ? "Concluído" : "Pausado"}
                  </span>
                  {project.cliente && (
                    <span className="text-[11.5px] font-semibold bg-white/10 px-2.5 py-1 rounded-full text-white">
                      Cliente: {project.cliente}
                    </span>
                  )}
                  {project.valor > 0 && (
                    <span className="text-[11.5px] font-semibold bg-white/10 px-2.5 py-1 rounded-full text-white font-mono">
                      {BRL(project.valor)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Horizontal Relational Chain (FlowChain Component) */}
            <div className="p-5 border-b border-meta-navy-10 bg-meta-paper flex-shrink-0">
              <div className="eyebrow-mini mb-3 flex items-center gap-1.5 text-xs text-meta-navy-50 font-bold tracking-wider uppercase">
                <Icon name="link" size={13} /> Cadeia horizontal
              </div>
              <FlowChain steps={chainSteps} />
            </div>

            {/* Scrollable details view */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Associated Client info */}
              {project.cliente && (
                <div className="pb-4 border-b border-meta-navy-10">
                  <div className="eyebrow-mini mb-2.5 text-xs text-meta-navy-50 font-bold tracking-wider uppercase">
                    Cliente
                  </div>
                  <EntityPill type="cliente" label={project.cliente} />
                </div>
              )}

              {/* Description & contextual notes */}
              {project.descricao && (
                <div className="pb-4 border-b border-meta-navy-10">
                  <div className="eyebrow-mini mb-2.5 text-xs text-meta-navy-50 font-bold tracking-wider uppercase">
                    Descrição
                  </div>
                  <p className="text-sm text-meta-navy-70 leading-relaxed font-medium">
                    {project.descricao}
                  </p>
                </div>
              )}

              {/* Technical coordination */}
              <div className="pb-4 border-b border-meta-navy-10">
                <div className="eyebrow-mini mb-2.5 text-xs text-meta-navy-50 font-bold tracking-wider uppercase">
                  Coordenação
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  <span className="size-2 rounded-full" style={{ background: cor(project.coordSigla) }} />
                  {project.coord}
                </span>
              </div>

              {/* Allocated Team Members list */}
              <div className="pb-4 border-b border-meta-navy-10">
                <div className="eyebrow-mini mb-2.5 text-xs text-meta-navy-50 font-bold tracking-wider uppercase">
                  Equipe ({project.equipe.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.equipe.map((m, idx) => (
                    <EntityPill key={idx} type="pessoa" label={m} />
                  ))}
                </div>
              </div>

              {/* Contract Identifier */}
              {project.valor > 0 && (
                <div className="pb-4">
                  <div className="eyebrow-mini mb-2.5 text-xs text-meta-navy-50 font-bold tracking-wider uppercase">
                    Contrato
                  </div>
                  <EntityPill type="contrato" label={contractId} />
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/**
 * ProjetosView Component
 * Renders the external projects portfolio reading.
 * Allows filtering by coordination and execution status, switching layouts
 * (cards vs tabular list), opening detail drawers for individual items,
 * and displaying overall KPIs.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {ProjetoVM[]} props.projetos - The array of raw project database items.
 */
export function ProjetosView({ projetos }: { projetos: ProjetoVM[] }) {
  /**
   * Filter selection state for Technical Coordination.
   * Defaults to 'todas'.
   * @type {string}
   */
  const [fCoord, setFCoord] = useState("todas");

  /**
   * Filter selection state for execution status (todos, ativo, concluído, pausado).
   * Defaults to 'todos'.
   * @type {string}
   */
  const [fStatus, setFStatus] = useState("todos");

  /**
   * Current layout view mode.
   * Can be 'cards' (visual grid) or 'tabela' (detailed columns list).
   * @type {"cards" | "tabela"}
   */
  const [layout, setLayout] = useState<"cards" | "tabela">("cards");

  /**
   * Holds the project selected to be displayed inside the EntityDrawer.
   * Null when drawer is closed.
   * @type {ProjetoWithStatus | null}
   */
  const [selectedProj, setSelectedProj] = useState<ProjetoWithStatus | null>(null);

  // DERIVED STATE PROCESS:
  // Maps the received raw projects, ensuring a status field exists by fallback
  // checks against description keywords (e.g. "pausado", "concluido", "concluído", "no prazo", "atrasado").
  const projetosComStatus: ProjetoWithStatus[] = projetos.map((p) => {
    let status: "ativo" | "concluido" | "pausado" = "ativo";
    if (p.status) {
      status = p.status;
    } else if (p.descricao) {
      const descLower = p.descricao.toLowerCase();
      if (descLower.includes("pausado")) {
        status = "pausado";
      } else if (descLower.includes("concluido") || descLower.includes("concluído")) {
        status = "concluido";
      } else if (descLower.includes("no prazo") || descLower.includes("atrasado")) {
        status = "ativo";
      }
    }
    return { ...p, status };
  });

  // Extract unique sorted list of coordination acronyms in dataset
  const coords = [...new Set(projetosComStatus.map((p) => p.coordSigla))].filter(Boolean).sort();
  
  // Filter projects by active status and coordination selections
  const projs = projetosComStatus.filter(
    (p) =>
      (fStatus === "todos" || p.status === fStatus) &&
      (fCoord === "todas" || p.coordSigla === fCoord)
  );

  // Calculate sum of contracts budget values
  const valorTotal = projetosComStatus.reduce((s, p) => s + p.valor, 0);
  // Calculate count of projects containing active contracts
  const comContrato = projetosComStatus.filter((p) => p.valor > 0).length;

  // Status statistics helper array to compute indicator counts in filter buttons
  const statusChips = [
    { k: "todos", l: "Todos", n: projetosComStatus.filter((p) => fCoord === "todas" || p.coordSigla === fCoord).length },
    { k: "ativo", l: "Em execução", n: projetosComStatus.filter((p) => p.status === "ativo" && (fCoord === "todas" || p.coordSigla === fCoord)).length },
    { k: "concluido", l: "Concluídos", n: projetosComStatus.filter((p) => p.status === "concluido" && (fCoord === "todas" || p.coordSigla === fCoord)).length },
    { k: "pausado", l: "Pausados", n: projetosComStatus.filter((p) => p.status === "pausado" && (fCoord === "todas" || p.coordSigla === fCoord)).length },
  ];

  return (
    <div className="mx-auto max-w-[1480px]">
      {/* Page header with subtitle description */}
      <PageHeader
        eyebrow="Estrutura & Operação"
        title="Projetos Externos"
        description="Leitura de portfólio — os projetos como entidades conectadas a pessoas, coordenações, clientes e contratos. Visão estratégica, não gestão operacional."
      />

      {/* KPI Stats Grid - 4 columns */}
      <div className="grid-mvp cols-4 mb-[22px]">
        <Kpi icon="projects" label="Projetos no portfólio" value={projetos.length} note="entidades conectadas" />
        <Kpi icon="dollar" label="Valor em portfólio" value={BRL(valorTotal)} note="soma dos contratos" />
        <Kpi icon="doc" label="Com contrato" value={comContrato} note={`de ${projetos.length} projetos`} />
        <Kpi icon="branch" label="Coordenações" value={coords.length} note="áreas envolvidas" />
      </div>

      {/* Controls row: status buttons and coordination select layout switch */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Status selection chip buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {statusChips.map((c) => (
            <button
              key={c.k}
              onClick={() => setFStatus(c.k)}
              className={`cursor-pointer font-bold text-xs py-1.5 px-3.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                fStatus === c.k
                  ? "bg-meta-navy text-white border-meta-navy"
                  : "bg-white text-meta-navy-70 border-meta-navy-10 hover:text-meta-navy hover:border-meta-navy-30"
              }`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {c.l}
              <span className={`text-[11px] font-semibold ${fStatus === c.k ? "text-white/70" : "text-meta-navy-50"}`}>
                {c.n}
              </span>
            </button>
          ))}
        </div>

        {/* Coordination dropdown & layout toggle buttons */}
        <div className="flex items-center gap-2">
          <MetaSelect value={fCoord} onChange={setFCoord} options={[["todas", "Todas coordenações"], ...coords.map((c) => [c, c] as [string, string])]} />
          <div className="seg">
            {/* Grid layout switcher */}
            <div className={"seg__opt" + (layout === "cards" ? " active" : "")} onClick={() => setLayout("cards")}><Icon name="grid" size={15} /></div>
            {/* Table layout switcher */}
            <div className={"seg__opt" + (layout === "tabela" ? " active" : "")} onClick={() => setLayout("tabela")}><Icon name="table" size={15} /></div>
          </div>
        </div>
      </div>

      {/* CONDITIONAL RENDER: Cards Grid Layout vs Tabular List Layout */}
      {layout === "cards" ? (
        <div className="grid-mvp cols-3">
          {projs.map((p) => (
            <div
              key={p.id}
              className="card card--pad flex flex-col gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              onClick={() => setSelectedProj(p)}
            >
              {/* Card Top: ID and colored execution status badge */}
              <div className="flex items-center justify-between">
                <span className="eyebrow-mini">#{p.id}</span>
                <StatusBadge
                  cls={p.status === "ativo" ? "info" : p.status === "concluido" ? "success" : "neutral"}
                  label={p.status === "ativo" ? "Em execução" : p.status === "concluido" ? "Concluído" : "Pausado"}
                />
              </div>
              <div className="text-[17px] font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{p.nome}</div>
              {/* Client indicator and coordination label */}
              <div className="flex flex-wrap gap-1.5">
                {p.cliente && <span className="epill e-cliente"><span className="epill__dot" />{p.cliente}</span>}
                <span className="inline-flex items-center gap-1.5 text-xs text-meta-navy-50">
                  <span className="size-2 rounded-full" style={{ background: cor(p.coordSigla) }} />{p.coordSigla || "—"}
                </span>
              </div>
              <hr className="hr" />
              {/* Card Footer: Team members avatar overlap stack + formatted budget contract value */}
              <div className="flex items-center justify-between">
                <AvatarStack ids={p.equipe} max={4} size={24} />
                <span className="font-bold text-meta-navy" style={{ fontFamily: "var(--font-heading)" }}>{p.valor > 0 ? BRL(p.valor) : "—"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed Tabular Columns Layout */
        <Card pad={false}>
          <div className="overflow-x-auto">
            <table className="tbl" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Status</th>
                  <th>Coordenação</th>
                  <th>Cliente</th>
                  <th>Equipe</th>
                  <th className="num">Valor</th>
                </tr>
              </thead>
              <tbody>
                {projs.map((p) => (
                  <tr key={p.id} className="cursor-pointer" onClick={() => setSelectedProj(p)}>
                    <td>
                      <div className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{p.nome}</div>
                      <div className="muted text-[11.5px] text-meta-navy-50">#{p.id}</div>
                    </td>
                    <td>
                      <StatusBadge
                        cls={p.status === "ativo" ? "info" : p.status === "concluido" ? "success" : "neutral"}
                        label={p.status === "ativo" ? "Em execução" : p.status === "concluido" ? "Concluído" : "Pausado"}
                      />
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ background: cor(p.coordSigla) }} />
                        {p.coord}
                      </span>
                    </td>
                    <td className="muted text-meta-navy-50">{p.cliente ?? "—"}</td>
                    <td><AvatarStack ids={p.equipe} max={3} size={22} /></td>
                    <td className="num">{p.valor > 0 ? BRL(p.valor) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Schema alignment note disclaimer */}
      <div className="mt-5">
        <PlaceholderNote>
          Leitura estratégica de portfólio. Status/progresso e acompanhamentos detalhados dependem de campos
          ainda não expostos pela API (projeto_externo não tem status no schema) — acompanhamento operacional
          permanece nas visões verticais.
        </PlaceholderNote>
      </div>

      {/* Side-out project details EntityDrawer component */}
      <EntityDrawer project={selectedProj} onClose={() => setSelectedProj(null)} />
    </div>
  );
}
