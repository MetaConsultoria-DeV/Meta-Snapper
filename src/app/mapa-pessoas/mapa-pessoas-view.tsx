"use client";

import { useState } from "react";
import Image from "next/image";
import type { Org, OrgNode as OrgNodeT, OrgCelula, OrgNodeType } from "@/lib/org-data";
import { PageHeader } from "@/components/page-header";
import { Kpi, Card, Badge, PlaceholderNote } from "@/components/dashboard/primitives";
import { MetaSelect } from "@/components/dashboard/meta-select";
import { Icon } from "@/components/dashboard/icon";

/**
 * OrgNode Component
 * Recursively renders nodes of the organization tree.
 * Displays the member's role, name, and details (e.g., area of responsibility).
 * If the node has children, it renders a nested list `<ul>` mapping them recursively to child `OrgNode` components.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {OrgNodeT} props.node - The hierarchical organization node to render.
 */
function OrgNode({ node }: { node: OrgNodeT }) {
  const kids = node.children ?? [];
  return (
    <li>
      {/* Node display block styled by node type (director, PMO, manager, coordinator, staff, group) */}
      <div className={"onode t-" + node.type}>
        <span className="orole">{node.role}</span>
        <span className="oname">{node.name}</span>
        {node.detail && <span className="odetail">{node.detail}</span>}
      </div>
      {/* Recursively render child nodes if they exist */}
      {kids.length > 0 && (
        <ul>
          {kids.map((k, i) => (
            <OrgNode key={i} node={k} />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * OrgChart Component
 * Renders the wrapper container for the organizational tree structure.
 * Places the director node at the top and prints the children nodes below inside a CSS-based tree list.
 * Supports horizontal scrolling on smaller screens.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {OrgCelula} props.cel - The active organization cell data.
 */
function OrgChart({ cel }: { cel: OrgCelula }) {
  return (
    <div className="org-scroll">
      <div className="org-tree-wrap">
        {/* Top Director Node */}
        <div className="onode t-director">
          <span className="orole">{cel.diretor.role}</span>
          <span className="oname">{cel.diretor.name}</span>
          {cel.diretor.detail && <span className="odetail">{cel.diretor.detail}</span>}
        </div>
        {/* Children tree structure list */}
        <ul className="tree">
          {cel.tree.map((n, i) => (
            <OrgNode key={i} node={n} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Tailwind badge styling lookup map for each organization node type.
 * @type {Record<OrgNodeType, "info" | "warning" | "neutral" | "ghost">}
 */
const tipoBadge: Record<OrgNodeType, "info" | "warning" | "neutral" | "ghost"> = {
  director: "info",
  pmo: "warning",
  manager: "info",
  coord: "info",
  staff: "neutral",
  group: "ghost",
};

/**
 * MapaPessoasView Component
 * Renders the team directory and organizational structure page views.
 * Allows users to toggle between three view layouts:
 *  1. Interactive Organograma: Hierarchical tree chart of the selected cell.
 *  2. Células Overview: Grid card list summarizing each cell's headcount and leadership.
 *  3. Pessoas Directory: Paginated table containing directory positions with cell and level filters.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Org} props.org - The complete organization dataset (summary, cells, directory positions, level metadata).
 */
export function MapaPessoasView({ org }: { org: Org }) {
  const R = org.resumo;
  const tipoMeta = org.tipoMeta;

  /**
   * The currently active tab view.
   * Can be 'organograma', 'celulas', or 'pessoas'.
   * @type {"organograma" | "celulas" | "pessoas"}
   */
  const [view, setView] = useState<"organograma" | "celulas" | "pessoas">("organograma");

  /**
   * The ID of the active cell displayed inside the Organograma view.
   * Defaults to 'projetos'.
   * @type {string}
   */
  const [celAtiva, setCelAtiva] = useState("projetos");

  /**
   * The selected cell filter in the Pessoas directory table.
   * Defaults to 'todas' (no filter).
   * @type {string}
   */
  const [fCel, setFCel] = useState("todas");

  /**
   * The selected node level/role type filter in the Pessoas directory table.
   * Defaults to 'todos' (no filter).
   * @type {string}
   */
  const [fTipo, setFTipo] = useState("todos");

  // Derive the active cell object from dataset. Falls back to first item if not found.
  const cel = org.celulas.find((c) => c.id === celAtiva) ?? org.celulas[0];

  // Derive filtered list of directory positions. Excludes placeholder names marked as '—'.
  const posFiltradas = org.posicoes.filter(
    (p) =>
      (fCel === "todas" || p.cel === fCel) &&
      (fTipo === "todos" || p.tipo === fTipo) &&
      p.name !== "—",
  );

  return (
    <div className="mx-auto max-w-[1480px]">
      {/* Page header with context subtitle */}
      <PageHeader
        eyebrow="Estrutura & Operação"
        title="Mapa & Pessoas"
        description="A estrutura organizacional da Meta (SETTA 26.2) — as cinco células, suas lideranças e equipes, lidas como um sistema único. Navegue pelo organograma, pelas células ou pelo diretório de pessoas."
      />

      {/* KPI Panel Grid - 4 columns */}
      <div className="grid-mvp cols-4 mb-[22px]">
        <Kpi icon="people" label="Membros mapeados" value={R.headcountTotal} note={`${R.posicoes} posições na estrutura`} />
        <Kpi icon="grid" label="Células" value={R.celulas} note="núcleos organizacionais" />
        <Kpi icon="branch" label="Coordenações" value={R.coordCount} note="áreas técnicas de Projetos" />
        <Kpi icon="user" label="Lideranças" value={R.lideranca} note="diretoria · gerência · coord." trend="up" trendVal="cadeia de gestão" />
      </div>

      {/* Tab controls segment and filter count indicators */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="seg">
          <div className={"seg__opt" + (view === "organograma" ? " active" : "")} onClick={() => setView("organograma")}>
            <Icon name="network" size={15} />
            Organograma
          </div>
          <div className={"seg__opt" + (view === "celulas" ? " active" : "")} onClick={() => setView("celulas")}>
            <Icon name="grid" size={15} />
            Células
          </div>
          <div className={"seg__opt" + (view === "pessoas" ? " active" : "")} onClick={() => setView("pessoas")}>
            <Icon name="table" size={15} />
            Pessoas
          </div>
        </div>
        {/* Render filtered position counts when in Pessoas Directory view */}
        {view === "pessoas" && <div className="muted text-[13px] text-meta-navy-50">{posFiltradas.length} posições no recorte</div>}
      </div>

      {/* TAB CONTENT: Organograma View */}
      {view === "organograma" && (
        <>
          <div className="org-stage">
            {/* Active Cell Header Card inside Organograma */}
            <div className="org-stage__head">
              <Image className="org-stage__mascot" src={`/brand/mascots/${cel.mascot}.png`} alt={cel.nome} width={70} height={70} />
              <div>
                <div className="eyebrow">Célula · SETTA 26.2</div>
                <h2>
                  <em>{cel.nome}</em>
                </h2>
                <p>{cel.desc}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-[34px] font-extrabold leading-none tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
                  {cel.headcount}
                </div>
                <div className="mt-1 text-[11px] text-meta-navy-30">membros</div>
              </div>
            </div>
            {/* Horizontal sub-navigation tabs to change active Cell */}
            <div className="org-tabs">
              {org.celulas.map((c) => (
                <div key={c.id} className={"org-tab" + (celAtiva === c.id ? " active" : "")} onClick={() => setCelAtiva(c.id)}>
                  <Image src={`/brand/mascots/${c.mascot}.png`} alt="" width={22} height={22} />
                  {c.nome}
                </div>
              ))}
            </div>
            {/* Tree hierarchy chart graph */}
            <OrgChart cel={cel} />
            {/* Node type color legend */}
            <div className="org-legend">
              {Object.entries(tipoMeta).map(([k, v]) => (
                <span key={k}>
                  <i style={{ background: v.cor }} />
                  {v.label}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <PlaceholderNote>
              Organograma fiel à estrutura SETTA 26.2. Posições marcadas com &quot;—&quot; ainda não têm
              responsável nomeado. Dados de cada pessoa (projetos, contratos) conectam-se às demais visões
              conforme forem integrados.
            </PlaceholderNote>
          </div>
        </>
      )}

      {/* TAB CONTENT: Células Overview */}
      {view === "celulas" && (
        <div className="grid-mvp cols-3">
          {org.celulas.map((c) => (
            <div
              key={c.id}
              className="card card--pad flex cursor-pointer flex-col gap-3.5"
              style={{ borderTop: "3px solid " + c.cor }}
              onClick={() => {
                setCelAtiva(c.id);
                setView("organograma");
              }}
            >
              {/* Cell Identity */}
              <div className="flex items-center gap-3">
                <Image src={`/brand/mascots/${c.mascot}.png`} alt="" width={54} height={54} style={{ objectFit: "contain" }} />
                <div>
                  <div className="text-[17px] font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                    {c.nome}
                  </div>
                  <div className="muted text-xs text-meta-navy-50">{c.diretor.role}</div>
                </div>
              </div>
              {/* Cell Description */}
              <p className="muted text-[12.5px] leading-normal text-meta-navy-50" style={{ minHeight: 54 }}>
                {c.desc}
              </p>
              <hr className="hr" />
              {/* Leader info & headcount summary footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Generated Initials Avatar */}
                  <span className="av-circ" style={{ width: 32, height: 32, background: c.cor, fontSize: 11 }}>
                    {c.diretor.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <div className="leading-tight">
                    <div className="text-[12.5px] font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                      {c.diretor.name}
                    </div>
                    <div className="muted text-[10.5px] text-meta-navy-50">Liderança</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                    {c.headcount}
                  </div>
                  <div className="muted text-[10.5px] text-meta-navy-50">membros</div>
                </div>
              </div>
            </div>
          ))}
          {/* Final solid totals summary card */}
          <div className="card card--pad flex flex-col items-center justify-center gap-2.5 text-center text-white" style={{ background: "var(--meta-navy)" }}>
            <div className="text-[40px] font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {R.headcountTotal}
            </div>
            <div className="text-[13px] text-meta-navy-30">
              membros na Meta
              <br />
              distribuídos em {R.celulas} células
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Pessoas Directory */}
      {view === "pessoas" && (
        <>
          {/* Filters Bar Card */}
          <Card pad={true} className="mb-[18px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow-mini flex items-center gap-1.5">
                <Icon name="filter" size={13} />
                Filtros
              </span>
              {/* Select Cell dropdown */}
              <MetaSelect value={fCel} onChange={setFCel} options={[["todas", "Todas as células"], ...org.celulas.map((c) => [c.id, c.nome] as [string, string])]} />
              {/* Select Role Type dropdown */}
              <MetaSelect value={fTipo} onChange={setFTipo} options={[["todos", "Todos os níveis"], ...Object.entries(tipoMeta).map(([k, v]) => [k, v.label] as [string, string])]} />
              {/* Clear filters action button */}
              {(fCel !== "todas" || fTipo !== "todos") && (
                <button
                  className="card__action"
                  onClick={() => {
                    setFCel("todas");
                    setFTipo("todos");
                  }}
                >
                  Limpar
                </button>
              )}
            </div>
          </Card>
          {/* Directory Positions Table */}
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="tbl" style={{ minWidth: 760 }}>
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Cargo / Papel</th>
                    <th>Célula</th>
                    <th>Nível</th>
                    <th className="num">Pessoas</th>
                  </tr>
                </thead>
                <tbody>
                  {posFiltradas.map((p, i) => (
                    <tr key={i} style={{ cursor: "default" }}>
                      <td>
                        {/* Member initials avatar + Name */}
                        <div className="flex items-center gap-3">
                          <span className="av-circ" style={{ width: 30, height: 30, background: p.isGroup ? "var(--meta-navy-30)" : p.cor, fontSize: 10 }}>
                            {p.isGroup ? "··" : p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                          </span>
                          <span className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="muted text-meta-navy-50">
                        {p.role}
                        {p.detail && <span className="block text-[11px]">{p.detail}</span>}
                      </td>
                      <td>
                        {/* Cell Tag with color dot indicators */}
                        <span className="tag" style={{ padding: "2px 9px" }}>
                          <span className="rounded-full" style={{ width: 8, height: 8, background: p.cor, marginRight: 2 }} />
                          {p.celNome}
                        </span>
                      </td>
                      <td>
                        {/* Level badge component */}
                        <Badge kind={tipoBadge[p.tipo]} dot>
                          {tipoMeta[p.tipo].label}
                        </Badge>
                      </td>
                      <td className="num">{p.headcount || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
