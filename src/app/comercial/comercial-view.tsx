"use client";

import { useState } from "react";
import { BRL } from "@/lib/mock-data";
import type { FunilFaseDTO, OportunidadeDTO, NomeQtdDTO, ClienteComercialDTO } from "@/lib/api/bdu";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/dashboard/primitives";
import { Donut, Funnel3D } from "@/components/dashboard/charts";
import { MetaSelect } from "@/components/dashboard/meta-select";
import { Icon } from "@/components/dashboard/icon";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { AdaptiveTable } from "@/components/ui/adaptive-table";

/** Curadoria das fases cruas do Pipefy → pipeline ativo + estados terminais. */
type FaseTipo = "ganho" | "perdido" | "postergado" | "ativo";
function classificar(fase: string): FaseTipo {
  const n = fase.toLowerCase();
  if (n.includes("fechad") || n.includes("ganho")) return "ganho";
  if (n.includes("desist") || n.includes("recusad") || n.includes("perdid")) return "perdido";
  if (n.includes("posterg")) return "postergado";
  return "ativo";
}

/** Status terminal da oportunidade → rótulo + cor do badge. */
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ativo: { label: "Ativo", cls: "badge--info" },
  fechado: { label: "Ganho", cls: "badge--success" },
  desistido: { label: "Desistido", cls: "badge--danger" },
  recusado: { label: "Recusado", cls: "badge--neutral" },
  postergado: { label: "Postergado", cls: "badge--warning" },
};

/** Data ISO (YYYY-MM-DD…) → DD/MM/AAAA. */
const fmtData = (s: string | null) => (s ? s.slice(0, 10).split("-").reverse().join("/") : "—");

export function ComercialView({
  funil,
  oportunidades,
  origens,
  motivosPerda,
  clientes,
  periodoLabel,
}: {
  funil: FunilFaseDTO[];
  oportunidades: OportunidadeDTO[];
  origens: NomeQtdDTO[];
  motivosPerda: NomeQtdDTO[];
  clientes: ClienteComercialDTO[];
  periodoLabel: string;
}) {
  const [tab, setTab] = useState<"oportunidades" | "clientes">("oportunidades");
  const [fFase, setFFase] = useState("todas");
  const [currentPage, setCurrentPage] = useState(1);

  const updateFase = (novaFase: string) => {
    setFFase(novaFase);
    setCurrentPage(1);
  };

  // Ordem cronológica desejada para as fases ativas (excluindo Validação com Adm-Fin)
  const ORDEM_ATIVO = [
    "Caixa de Entrada",
    "Ligação Diagnóstico",
    "Reunião Diagnóstico",
    "Proposta Comercial",
    "Negociação",
    "Pré-Assinatura de Contrato",
  ];

  // separa pipeline ativo dos estados terminais
  const ativoBruto = funil.filter((f) => classificar(f.fase) === "ativo");
  const ativo = ORDEM_ATIVO.map((nomeFase) => {
    const encontrada = ativoBruto.find((f) => f.fase.toLowerCase() === nomeFase.toLowerCase());
    return encontrada || { fase: nomeFase, qtd: 0, valor: 0 };
  });
  
  const ganho = funil.filter((f) => classificar(f.fase) === "ganho");
  const perdido = funil.filter((f) => classificar(f.fase) === "perdido");
  const postergado = funil.filter((f) => classificar(f.fase) === "postergado");
  const sum = (arr: FunilFaseDTO[], k: "qtd" | "valor") => arr.reduce((s, f) => s + f[k], 0);

  const ganhoQtd = sum(ganho, "qtd");
  const perdidoQtd = sum(perdido, "qtd");
  const pipelineQtd = sum(ativo, "qtd");
  // `valor_fechado` só existe para oportunidades fechadas/terminais — pipeline ativo
  // não tem valor no banco. Usamos o valor GANHO (real e que varia por período).
  const ganhoValor = sum(ganho, "valor");
  const conversao = ganhoQtd + perdidoQtd > 0 ? Math.round((ganhoQtd / (ganhoQtd + perdidoQtd)) * 100) : 0;

  const faseOptions = [
    "todas",
    ...ORDEM_ATIVO,
    ...Array.from(
      new Set(
        funil
          .filter((f) => ["ganho", "perdido", "postergado"].includes(classificar(f.fase)))
          .map((f) => f.fase),
      ),
    ),
  ];
  const PAGE_SIZE = 200;
  const filteredOpps = fFase === "todas"
    ? oportunidades
    : oportunidades.filter((o) => o.fase.toLowerCase() === fFase.toLowerCase());

  const totalItems = filteredOpps.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * PAGE_SIZE;
  const opps = filteredOpps.slice(startIndex, startIndex + PAGE_SIZE);
  const palette = ["#E5484D", "#F5A623", "#7C4DFF", "#6B7299", "#B5BACC", "#22C0FF"];

  // Motivos de perda: lista mostra TODOS; o donut agrupa top 5 + "Outros" (resto),
  // mantendo o total correto no centro.
  const totalPerdas = motivosPerda.reduce((s, m) => s + m.qtd, 0);
  const restoPerdas = motivosPerda.slice(5).reduce((s, m) => s + m.qtd, 0);
  const donutSegs = [
    ...motivosPerda.slice(0, 5).map((m, i) => ({ value: m.qtd, color: palette[i] })),
    ...(restoPerdas > 0 ? [{ value: restoPerdas, color: "#C8CEDC" }] : []),
  ];

  return (
    <div className="mx-auto max-w-[1480px]">
      <PageHeader
        eyebrow="Comercial & Financeiro"
        title="Comercial, Oportunidades & Clientes"
        description="O fluxo comercial da Meta de ponta a ponta. Use o filtro de período no topo para recortar a leitura."
      />

      {/* Indicador do recorte global — o controle fica no topo e vale para todas as páginas. */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-meta-blue/10 px-3 py-1 text-[12px] font-semibold text-meta-blue">
          <Icon name="checkCircle" size={13} /> Lendo: {periodoLabel}
        </span>
        <span className="text-[12px] text-meta-navy-50">Ajuste o período no filtro do topo.</span>
      </div>

      {/* HEADER: FUNIL ATIVO + TERMINAIS */}
      <ResponsiveGrid cols="4-8-12" gap="md" className="mb-6 items-start">
        {/* Funnel card - 4/8 on mobile, 6 on tablet, 7 on desktop */}
        <div className="col-span-4 md:col-span-4 lg:col-span-7 overflow-hidden rounded-[18px] text-white" style={{ background: "var(--meta-navy)" }}>
          <div className="relative px-4 md:px-6 py-4 md:py-6">
            <div className="absolute inset-0 opacity-25" style={{ background: "url('/brand/network-corner.png') no-repeat top right", backgroundSize: "220px" }} />
            <div className="relative">
              <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                  <span className="eyebrow text-meta-blue-accent text-xs md:text-sm">Funil comercial · pipeline ativo</span>
                  <div className="mt-1 text-base md:text-lg font-bold break-words" style={{ fontFamily: "var(--font-heading)" }}>
                    {pipelineQtd} em aberto
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{conversao}%</div>
                  <div className="text-[10px] md:text-[11px] text-meta-navy-30 whitespace-nowrap">ganho / (ganho+perdido)</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div style={{ minWidth: "300px" }}>
                  <Funnel3D
                    stages={ativo.map((f) => ({ fase: f.fase, qtd: f.qtd, valor: f.valor }))}
                    onPhase={updateFase}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* terminais: atual vs histórico - 4/8 on mobile, 4 on tablet, 5 on desktop */}
        <div className="col-span-4 md:col-span-4 lg:col-span-5 flex flex-col gap-4">
          <Card title="Desfecho no período" sub="Estados terminais — fora do pipeline ativo">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
              {[
                { l: "Ganhos", v: ganhoQtd, c: "#1FBF6A", val: sum(ganho, "valor") },
                { l: "Perdidos", v: perdidoQtd, c: "#E5484D", val: 0 },
                { l: "Postergados", v: sum(postergado, "qtd"), c: "#F5A623", val: 0 },
              ].map((t) => (
                <div key={t.l} className="rounded-xl border border-meta-navy-10 p-2 md:p-3 text-center">
                  <div className="text-lg md:text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: t.c }}>{t.v}</div>
                  <div className="muted text-[10px] md:text-[11px] text-meta-navy-50">{t.l}</div>
                  {t.val > 0 && <div className="mt-1 text-[10px] md:text-[11px] font-semibold text-meta-navy-70">{BRL(t.val)}</div>}
                </div>
              ))}
            </div>
            <div className="placeholder-note mt-3">
              <Icon name="info" size={16} />
              Ganhos/Perdidos/Postergados não inflam o funil ativo — leitura atual protegida.
            </div>
          </Card>
          <Card title="Origem das oportunidades" sub="De onde vêm as demandas (no período)">
            <div className="mt-1 flex flex-col gap-2">
              {origens.slice(0, 5).map((o, i) => {
                const max = Math.max(...origens.map((x) => x.qtd), 1);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span title={o.nome} className="w-[88px] md:w-[140px] shrink-0 truncate text-xs md:text-[13px] text-meta-navy-70">{o.nome}</span>
                    <div className="h-4 flex-1 overflow-hidden rounded-md bg-meta-paper">
                      <div className="h-full rounded-md" style={{ width: (o.qtd / max) * 100 + "%", background: "var(--meta-blue)" }} />
                    </div>
                    <span className="w-6 md:w-8 text-right text-xs md:text-[13px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{o.qtd}</span>
                  </div>
                );
              })}
              {!origens.length && <span className="muted text-xs md:text-[13px] text-meta-navy-50">Sem origens registradas.</span>}
            </div>
          </Card>
        </div>
      </ResponsiveGrid>

      {/* motivos de perda */}
      {motivosPerda.length > 0 && (
        <ResponsiveGrid cols="4-8-12" gap="md" className="mb-6">
          <div className="col-span-4 md:col-span-8 lg:col-span-8">
            <Card title="Motivos de perda" sub={`Por que oportunidades não avançam (no período) · ${totalPerdas} perdas`}>
              <div className="flex flex-col lg:flex-row items-start gap-5 md:gap-6">
                <div className="mx-auto shrink-0 lg:mx-0">
                  <Donut size={120} segments={donutSegs} center={<div><div className="text-lg md:text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>{totalPerdas}</div><div className="text-[9px] md:text-[10px] text-meta-navy-50">perdas</div></div>} />
                </div>
                <div className="grid w-full flex-1 min-w-0 grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {motivosPerda.map((m, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-xs md:text-[13px]">
                      <span className="flex items-center gap-2 min-w-0"><span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: i < 5 ? palette[i] : "#C8CEDC" }} /><span className="truncate" title={m.nome}>{m.nome}</span></span>
                      <b style={{ fontFamily: "var(--font-heading)" }} className="shrink-0">{m.qtd}</b>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <Card title="Resumo do período" sub={periodoLabel}>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div><div className="text-lg md:text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{pipelineQtd}</div><div className="muted text-[10px] md:text-[11.5px] text-meta-navy-50">em pipeline ativo</div></div>
                <div><div className="text-lg md:text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{conversao}%</div><div className="muted text-[10px] md:text-[11.5px] text-meta-navy-50">conversão</div></div>
                <div><div className="text-lg md:text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{clientes.length}</div><div className="muted text-[10px] md:text-[11.5px] text-meta-navy-50">clientes</div></div>
                <div><div className="text-lg md:text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{BRL(ganhoValor)}</div><div className="muted text-[10px] md:text-[11.5px] text-meta-navy-50">ganho no período</div></div>
              </div>
            </Card>
          </div>
        </ResponsiveGrid>
      )}

      {/* TABS */}
      <div className="my-6 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="seg">
          <div className={"seg__opt" + (tab === "oportunidades" ? " active" : "")} onClick={() => setTab("oportunidades")}><Icon name="target" size={15} />Oportunidades</div>
          <div className={"seg__opt" + (tab === "clientes" ? " active" : "")} onClick={() => setTab("clientes")}><Icon name="building" size={15} />Clientes</div>
        </div>
        {tab === "oportunidades" && (
          <div className="w-full sm:w-auto">
            <MetaSelect value={fFase} onChange={updateFase} options={faseOptions.map((f) => [f, f === "todas" ? "Todas as fases" : f] as [string, string])} />
          </div>
        )}
      </div>

      {tab === "oportunidades" ? (
        <Card pad={false}>
          <AdaptiveTable className="max-h-96">
            <thead>
              <tr><th className="min-w-12">ID</th><th className="min-w-20">Criado em</th><th className="min-w-32">Card / Contato</th><th className="min-w-24">Fase</th><th className="min-w-20">Status</th><th className="min-w-24">Origem</th><th className="min-w-16">Coord.</th><th className="min-w-28">Motivo</th></tr>
            </thead>
            <tbody>
              {opps.map((o) => {
                const st = STATUS_BADGE[o.status_terminal] ?? { label: o.status_terminal, cls: "badge--ghost" };
                return (
                  <tr key={o.id}>
                    <td className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>#{o.id}</td>
                    <td className="muted text-meta-navy-50 whitespace-nowrap text-xs md:text-sm">{fmtData(o.criado_em)}</td>
                    <td className="font-medium text-meta-navy truncate text-xs md:text-sm" title={o.lead ?? undefined}>{o.lead ?? "—"}</td>
                    <td><span className="badge badge--info text-xs md:text-sm">{o.fase}</span></td>
                    <td><span className={`badge ${st.cls} text-xs md:text-sm`}>{st.label}</span></td>
                    <td className="muted text-meta-navy-50 truncate text-xs md:text-sm">{o.origem ?? "—"}</td>
                    <td><span className="text-xs md:text-sm">{o.coordenacao_sigla ?? <span className="muted text-meta-navy-50">—</span>}</span></td>
                    <td className="muted text-meta-navy-50 truncate text-xs md:text-sm" title={o.motivo_perda ?? undefined}>{o.motivo_perda ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </AdaptiveTable>
          {/* Paginação */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-meta-navy-10 px-4 py-3 bg-meta-paper/50">
            <div className="text-xs md:text-sm text-meta-navy-50 muted">
              Exibindo {totalItems > 0 ? startIndex + 1 : 0} a {Math.min(startIndex + PAGE_SIZE, totalItems)} de {totalItems} {fFase !== "todas" ? `em "${fFase}"` : ""} (total: {oportunidades.length} no período).
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {/* Botão Anterior */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={activePage === 1}
                  className="flex size-8 items-center justify-center rounded-lg text-meta-navy-50 hover:bg-meta-navy-10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  &lt;
                </button>

                {/* Números de Página */}
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  
                  let startPage = Math.max(1, activePage - 2);
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  if (endPage - startPage < maxVisible - 1) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className={`px-3 py-1.5 text-sm transition-all font-medium cursor-pointer relative ${
                          activePage === 1
                            ? "font-bold text-meta-navy-80 after:absolute after:bottom-0 after:left-1/4 after:right-1/4 after:h-[2px] after:bg-meta-navy-70"
                            : "text-meta-navy-30 hover:text-meta-navy hover:font-semibold"
                        }`}
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="dots-start" className="px-1 text-meta-navy-30 text-sm">
                          ...
                        </span>
                      );
                    }
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1.5 text-sm transition-all font-medium cursor-pointer relative ${
                          activePage === i
                            ? "font-bold text-meta-navy-80 after:absolute after:bottom-0 after:left-1/4 after:right-1/4 after:h-[2px] after:bg-meta-navy-70"
                            : "text-meta-navy-30 hover:text-meta-navy hover:font-semibold"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="dots-end" className="px-1 text-meta-navy-30 text-sm">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-1.5 text-sm transition-all font-medium cursor-pointer relative ${
                          activePage === totalPages
                            ? "font-bold text-meta-navy-80 after:absolute after:bottom-0 after:left-1/4 after:right-1/4 after:h-[2px] after:bg-meta-navy-70"
                            : "text-meta-navy-30 hover:text-meta-navy hover:font-semibold"
                        }`}
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}

                {/* Botão Próximo */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={activePage === totalPages}
                  className="flex size-8 items-center justify-center rounded-lg text-meta-navy-50 hover:bg-meta-navy-10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <ResponsiveGrid cols="4-8-12" gap="md">
          {clientes.slice(0, 30).map((c) => (
            <div key={c.id} className="col-span-4 md:col-span-4 lg:col-span-4 card card--pad flex flex-col gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="av-circ shrink-0" style={{ width: 38, height: 38, background: "#22C0FF", fontSize: 13 }}>{c.nome.slice(0, 2).toUpperCase()}</span>
                <div className="text-sm md:text-[15px] font-bold min-w-0 truncate" style={{ fontFamily: "var(--font-heading)" }}>{c.nome}</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div><div className="text-base md:text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{c.oportunidades}</div><div className="muted text-[10px] md:text-[11px] text-meta-navy-50">oportunidades</div></div>
                <div><div className="text-base md:text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{c.contratos}</div><div className="muted text-[10px] md:text-[11px] text-meta-navy-50">contratos</div></div>
                <div className="ml-auto sm:ml-0 text-right sm:text-left"><div className="text-base md:text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{BRL(c.receita)}</div><div className="muted text-[10px] md:text-[11px] text-meta-navy-50">receita</div></div>
              </div>
            </div>
          ))}
        </ResponsiveGrid>
      )}
    </div>
  );
}
