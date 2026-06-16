"use client";

import { useState } from "react";
import Link from "next/link";
import { BRL } from "@/lib/mock-data";
import type { FunilFaseDTO, OportunidadeDTO, NomeQtdDTO, ClienteComercialDTO } from "@/lib/api/bdu";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/dashboard/primitives";
import { Donut, Funnel3D } from "@/components/dashboard/charts";
import { MetaSelect } from "@/components/dashboard/meta-select";
import { Icon } from "@/components/dashboard/icon";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { AdaptiveTable } from "@/components/ui/adaptive-table";
import { cn } from "@/lib/utils";

const PERIODOS: { key: string; label: string }[] = [
  { key: "30d", label: "30 dias" },
  { key: "trimestre", label: "Trimestre" },
  { key: "ano", label: "Ano atual" },
  { key: "tudo", label: "Tudo" },
];

/** Curadoria das fases cruas do Pipefy → pipeline ativo + estados terminais. */
type FaseTipo = "ganho" | "perdido" | "postergado" | "ativo";
function classificar(fase: string): FaseTipo {
  const n = fase.toLowerCase();
  if (n.includes("fechad") || n.includes("ganho")) return "ganho";
  if (n.includes("desist") || n.includes("recusad") || n.includes("perdid")) return "perdido";
  if (n.includes("posterg")) return "postergado";
  return "ativo";
}

export function ComercialView({
  funil,
  oportunidades,
  origens,
  motivosPerda,
  clientes,
  periodo,
  periodoLabel,
}: {
  funil: FunilFaseDTO[];
  oportunidades: OportunidadeDTO[];
  origens: NomeQtdDTO[];
  motivosPerda: NomeQtdDTO[];
  clientes: ClienteComercialDTO[];
  periodo: string;
  periodoLabel: string;
}) {
  const [tab, setTab] = useState<"oportunidades" | "clientes">("oportunidades");
  const [fFase, setFFase] = useState("todas");

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
  const pipelineValor = sum(ativo, "valor");
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
  const opps = (fFase === "todas" ? oportunidades : oportunidades.filter((o) => o.fase === fFase)).slice(0, 200);
  const palette = ["#E5484D", "#F5A623", "#7C4DFF", "#6B7299", "#B5BACC", "#22C0FF"];

  return (
    <div className="mx-auto max-w-[1480px]">
      <PageHeader
        eyebrow="Comercial & Financeiro"
        title="Comercial, Oportunidades & Clientes"
        description="O fluxo comercial da Meta de ponta a ponta. Gestão temporal forte: o recorte abaixo protege a leitura atual de dados antigos."
      />

      {/* RECORTE TEMPORAL */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow-mini flex items-center gap-1.5 text-meta-navy-50">
            <Icon name="calendar" size={13} /> Período analisado
          </span>
          <div className="period-seg flex overflow-x-auto overflow-y-hidden rounded-[10px] border border-meta-navy-10 bg-white">
            {PERIODOS.map((p) => (
              <Link
                key={p.key}
                href={`/comercial?periodo=${p.key}`}
                className={cn(
                  "border-r border-meta-navy-10 px-2.5 md:px-3 py-3 text-xs md:text-[13px] font-medium last:border-r-0 transition-colors whitespace-nowrap min-h-11",
                  periodo === p.key ? "bg-meta-navy text-white" : "text-meta-navy-50 hover:bg-meta-paper",
                )}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-meta-blue/10 px-3 py-1 text-[12px] font-semibold text-meta-blue">
          <Icon name="checkCircle" size={13} /> Lendo: {periodoLabel}
        </span>
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
                    {pipelineQtd} em aberto · {BRL(pipelineValor)}
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
                    onPhase={setFFase}
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
          <Card title="Origem das oportunidades" sub="De onde vêm as demandas (histórico)">
            <div className="mt-1 flex flex-col gap-2">
              {origens.slice(0, 5).map((o, i) => {
                const max = Math.max(...origens.map((x) => x.qtd), 1);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="min-w-[80px] md:min-w-[120px] truncate text-xs md:text-[13px] text-meta-navy-70">{o.nome}</span>
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
          <div className="col-span-4 md:col-span-4 lg:col-span-6">
            <Card title="Motivos de perda" sub="Por que oportunidades não avançam (histórico)">
              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5">
                <div className="shrink-0">
                  <Donut size={100} segments={motivosPerda.slice(0, 5).map((m, i) => ({ value: m.qtd, color: palette[i] }))} center={<div><div className="text-base md:text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>{motivosPerda.reduce((s, m) => s + m.qtd, 0)}</div><div className="text-[9px] md:text-[10px] text-meta-navy-50">perdas</div></div>} />
                </div>
                <div className="flex flex-1 flex-col gap-2 min-w-0">
                  {motivosPerda.slice(0, 5).map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs md:text-[13px] gap-2">
                      <span className="flex items-center gap-2 min-w-0"><span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: palette[i] }} /><span className="truncate">{m.nome}</span></span>
                      <b style={{ fontFamily: "var(--font-heading)" }} className="shrink-0">{m.qtd}</b>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          <div className="col-span-4 md:col-span-4 lg:col-span-6">
            <Card title="Resumo do período" sub={periodoLabel}>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div><div className="text-lg md:text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{pipelineQtd}</div><div className="muted text-[10px] md:text-[11.5px] text-meta-navy-50">em pipeline ativo</div></div>
                <div><div className="text-lg md:text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{conversao}%</div><div className="muted text-[10px] md:text-[11.5px] text-meta-navy-50">conversão</div></div>
                <div><div className="text-lg md:text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{clientes.length}</div><div className="muted text-[10px] md:text-[11.5px] text-meta-navy-50">clientes</div></div>
                <div><div className="text-lg md:text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{BRL(pipelineValor)}</div><div className="muted text-[10px] md:text-[11.5px] text-meta-navy-50">pipeline</div></div>
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
            <MetaSelect value={fFase} onChange={setFFase} options={faseOptions.map((f) => [f, f === "todas" ? "Todas as fases" : f] as [string, string])} />
          </div>
        )}
      </div>

      {tab === "oportunidades" ? (
        <Card pad={false}>
          <AdaptiveTable className="max-h-96">
            <thead>
              <tr><th className="min-w-12">ID</th><th className="min-w-24">Cliente</th><th className="min-w-20">Coordenação</th><th className="min-w-20">Fase</th><th className="min-w-24">Origem</th><th className="num min-w-20">Valor</th></tr>
            </thead>
            <tbody>
              {opps.map((o) => (
                <tr key={o.id}>
                  <td className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>#{o.id}</td>
                  <td className="muted text-meta-navy-50 truncate">{o.cliente ?? "—"}</td>
                  <td><span className="text-xs md:text-sm">{o.coordenacao_sigla ?? <span className="muted text-meta-navy-50">—</span>}</span></td>
                  <td><span className="badge badge--info text-xs md:text-sm">{o.fase}</span></td>
                  <td className="muted text-meta-navy-50 truncate text-xs md:text-sm">{o.origem ?? "—"}</td>
                  <td className="num text-xs md:text-sm whitespace-nowrap">{o.valor ? BRL(o.valor) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </AdaptiveTable>
          {oportunidades.length > 200 && <div className="muted px-4 py-2 text-xs md:text-[12px] text-meta-navy-50">Exibindo 200 de {oportunidades.length} no período.</div>}
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
