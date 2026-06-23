"use client";

import { useState } from "react";
import Image from "next/image";
import type { Org, OrgNode as OrgNodeT, OrgCelula, OrgNodeType } from "@/lib/org-data";
import { PageHeader } from "@/components/page-header";
import { Kpi, Card, Badge, PlaceholderNote } from "@/components/dashboard/primitives";
import { MetaSelect } from "@/components/dashboard/meta-select";
import { Icon } from "@/components/dashboard/icon";

function OrgNode({ node }: { node: OrgNodeT }) {
  const kids = node.children ?? [];
  return (
    <li>
      <div className={"onode t-" + node.type}>
        <span className="orole">{node.role}</span>
        <span className="oname">{node.name}</span>
        {node.detail && <span className="odetail">{node.detail}</span>}
      </div>
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

function OrgChart({ cel }: { cel: OrgCelula }) {
  return (
    <div className="org-scroll">
      <div className="org-tree-wrap">
        <div className="onode t-director">
          <span className="orole">{cel.diretor.role}</span>
          <span className="oname">{cel.diretor.name}</span>
          {cel.diretor.detail && <span className="odetail">{cel.diretor.detail}</span>}
        </div>
        <ul className="tree">
          {cel.tree.map((n, i) => (
            <OrgNode key={i} node={n} />
          ))}
        </ul>
      </div>
    </div>
  );
}

const tipoBadge: Record<OrgNodeType, "info" | "warning" | "neutral" | "ghost"> = {
  director: "info",
  pmo: "warning",
  manager: "info",
  coord: "info",
  staff: "neutral",
  group: "ghost",
};

export function MapaPessoasView({ org }: { org: Org }) {
  const R = org.resumo;
  const tipoMeta = org.tipoMeta;
  const [view, setView] = useState<"organograma" | "celulas" | "pessoas">("organograma");
  const [celAtiva, setCelAtiva] = useState("projetos");
  const [fCel, setFCel] = useState("todas");
  const [fTipo, setFTipo] = useState("todos");

  const cel = org.celulas.find((c) => c.id === celAtiva) ?? org.celulas[0];
  const posFiltradas = org.posicoes.filter(
    (p) =>
      (fCel === "todas" || p.cel === fCel) &&
      (fTipo === "todos" || p.tipo === fTipo) &&
      p.name !== "—",
  );

  return (
    <div className="mx-auto max-w-[1480px]">
      <PageHeader
        eyebrow="Estrutura & Operação"
        title="Mapa & Pessoas"
        description="A estrutura organizacional da Meta (SETTA 26.2) — as cinco células, suas lideranças e equipes, lidas como um sistema único. Navegue pelo organograma, pelas células ou pelo diretório de pessoas."
      />

      <div className="grid-mvp cols-4 mb-[22px]">
        <Kpi icon="people" label="Membros mapeados" value={R.headcountTotal} note={`${R.posicoes} posições na estrutura`} />
        <Kpi icon="grid" label="Células" value={R.celulas} note="núcleos organizacionais" />
        <Kpi icon="branch" label="Coordenações" value={R.coordCount} note="áreas técnicas de Projetos" />
        <Kpi icon="user" label="Lideranças" value={R.lideranca} note="diretoria · gerência · coord." trend="up" trendVal="cadeia de gestão" />
      </div>

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
        {view === "pessoas" && <div className="muted text-[13px] text-meta-navy-50">{posFiltradas.length} posições no recorte</div>}
      </div>

      {view === "organograma" && (
        <>
          <div className="org-stage">
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
            <div className="org-tabs">
              {org.celulas.map((c) => (
                <div key={c.id} className={"org-tab" + (celAtiva === c.id ? " active" : "")} onClick={() => setCelAtiva(c.id)}>
                  <Image src={`/brand/mascots/${c.mascot}.png`} alt="" width={22} height={22} />
                  {c.nome}
                </div>
              ))}
            </div>
            <OrgChart cel={cel} />
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
              <div className="flex items-center gap-3">
                <Image src={`/brand/mascots/${c.mascot}.png`} alt="" width={54} height={54} style={{ objectFit: "contain" }} />
                <div>
                  <div className="text-[17px] font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                    {c.nome}
                  </div>
                  <div className="muted text-xs text-meta-navy-50">{c.diretor.role}</div>
                </div>
              </div>
              <p className="muted text-[12.5px] leading-normal text-meta-navy-50" style={{ minHeight: 54 }}>
                {c.desc}
              </p>
              <hr className="hr" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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

      {view === "pessoas" && (
        <>
          <Card pad={true} className="mb-[18px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow-mini flex items-center gap-1.5">
                <Icon name="filter" size={13} />
                Filtros
              </span>
              <MetaSelect value={fCel} onChange={setFCel} options={[["todas", "Todas as células"], ...org.celulas.map((c) => [c.id, c.nome] as [string, string])]} />
              <MetaSelect value={fTipo} onChange={setFTipo} options={[["todos", "Todos os níveis"], ...Object.entries(tipoMeta).map(([k, v]) => [k, v.label] as [string, string])]} />
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
                        <span className="tag" style={{ padding: "2px 9px" }}>
                          <span className="rounded-full" style={{ width: 8, height: 8, background: p.cor, marginRight: 2 }} />
                          {p.celNome}
                        </span>
                      </td>
                      <td>
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
