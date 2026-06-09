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
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="eyebrow-mini flex items-center gap-1.5 text-meta-navy-50">
          <Icon name="calendar" size={13} /> Período analisado
        </span>
        <div className="period-seg flex overflow-hidden rounded-[10px] border border-meta-navy-10 bg-white">
          {PERIODOS.map((p) => (
            <Link
              key={p.key}
              href={`/comercial?periodo=${p.key}`}
              className={cn(
                "border-r border-meta-navy-10 px-3 py-1.5 text-[13px] font-medium last:border-r-0 transition-colors",
                periodo === p.key ? "bg-meta-navy text-white" : "text-meta-navy-50 hover:bg-meta-paper",
              )}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {p.label}
            </Link>
          ))}
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-meta-blue/10 px-3 py-1 text-[12px] font-semibold text-meta-blue">
          <Icon name="checkCircle" size={13} /> Lendo: {periodoLabel}
        </span>
      </div>

      {/* HEADER: FUNIL ATIVO + TERMINAIS */}
      <div className="grid-mvp mb-6 items-stretch" style={{ gridTemplateColumns: "1.25fr 1fr" }}>
        <div className="overflow-hidden rounded-[18px] text-white" style={{ background: "var(--meta-navy)" }}>
          <div className="relative px-[26px] py-[22px]">
            <div className="absolute inset-0 opacity-25" style={{ background: "url('/brand/network-corner.png') no-repeat top right", backgroundSize: "220px" }} />
            <div className="relative">
              <div className="mb-[18px] flex items-center justify-between">
                <div>
                  <span className="eyebrow text-meta-blue-accent">Funil comercial · pipeline ativo</span>
                  <div className="mt-1 text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{pipelineQtd} em aberto · {BRL(pipelineValor)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[28px] font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{conversao}%</div>
                  <div className="text-[11px] text-meta-navy-30">ganho / (ganho+perdido)</div>
                </div>
              </div>
              <Funnel3D
                stages={ativo.map((f) => ({ fase: f.fase, qtd: f.qtd, valor: f.valor }))}
                onPhase={setFFase}
              />
            </div>
          </div>
        </div>

        {/* terminais: atual vs histórico */}
        <div className="flex flex-col gap-5">
          <Card title="Desfecho no período" sub="Estados terminais — fora do pipeline ativo">
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Ganhos", v: ganhoQtd, c: "#1FBF6A", val: sum(ganho, "valor") },
                { l: "Perdidos", v: perdidoQtd, c: "#E5484D", val: 0 },
                { l: "Postergados", v: sum(postergado, "qtd"), c: "#F5A623", val: 0 },
              ].map((t) => (
                <div key={t.l} className="rounded-xl border border-meta-navy-10 p-3 text-center">
                  <div className="text-[22px] font-bold" style={{ fontFamily: "var(--font-heading)", color: t.c }}>{t.v}</div>
                  <div className="muted text-[11px] text-meta-navy-50">{t.l}</div>
                  {t.val > 0 && <div className="mt-1 text-[11px] font-semibold text-meta-navy-70">{BRL(t.val)}</div>}
                </div>
              ))}
            </div>
            <div className="placeholder-note mt-3">
              <Icon name="info" size={18} />
              Ganhos/Perdidos/Postergados não inflam o funil ativo — leitura atual protegida.
            </div>
          </Card>
          <Card title="Origem das oportunidades" sub="De onde vêm as demandas (histórico)">
            <div className="mt-1 flex flex-col gap-2">
              {origens.slice(0, 5).map((o, i) => {
                const max = Math.max(...origens.map((x) => x.qtd), 1);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-[120px] truncate text-[13px] text-meta-navy-70">{o.nome}</span>
                    <div className="h-[16px] flex-1 overflow-hidden rounded-md bg-meta-paper">
                      <div className="h-full rounded-md" style={{ width: (o.qtd / max) * 100 + "%", background: "var(--meta-blue)" }} />
                    </div>
                    <span className="w-8 text-right text-[13px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{o.qtd}</span>
                  </div>
                );
              })}
              {!origens.length && <span className="muted text-[13px] text-meta-navy-50">Sem origens registradas.</span>}
            </div>
          </Card>
        </div>
      </div>

      {/* motivos de perda */}
      {motivosPerda.length > 0 && (
        <div className="grid-mvp cols-2 mb-1.5">
          <Card title="Motivos de perda" sub="Por que oportunidades não avançam (histórico)">
            <div className="flex items-center gap-5">
              <Donut size={132} segments={motivosPerda.slice(0, 5).map((m, i) => ({ value: m.qtd, color: palette[i] }))} center={<div><div className="text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>{motivosPerda.reduce((s, m) => s + m.qtd, 0)}</div><div className="text-[10px] text-meta-navy-50">perdas</div></div>} />
              <div className="flex flex-1 flex-col gap-2">
                {motivosPerda.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2"><span className="size-2.5 rounded-[3px]" style={{ background: palette[i] }} />{m.nome}</span>
                    <b style={{ fontFamily: "var(--font-heading)" }}>{m.qtd}</b>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card title="Resumo do período" sub={periodoLabel}>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-[22px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{pipelineQtd}</div><div className="muted text-[11.5px] text-meta-navy-50">em pipeline ativo</div></div>
              <div><div className="text-[22px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{conversao}%</div><div className="muted text-[11.5px] text-meta-navy-50">conversão</div></div>
              <div><div className="text-[22px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{clientes.length}</div><div className="muted text-[11.5px] text-meta-navy-50">clientes</div></div>
              <div><div className="text-[22px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{BRL(pipelineValor)}</div><div className="muted text-[11.5px] text-meta-navy-50">pipeline</div></div>
            </div>
          </Card>
        </div>
      )}

      {/* TABS */}
      <div className="my-7 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="seg">
          <div className={"seg__opt" + (tab === "oportunidades" ? " active" : "")} onClick={() => setTab("oportunidades")}><Icon name="target" size={15} />Oportunidades</div>
          <div className={"seg__opt" + (tab === "clientes" ? " active" : "")} onClick={() => setTab("clientes")}><Icon name="building" size={15} />Clientes</div>
        </div>
        {tab === "oportunidades" && (
          <MetaSelect value={fFase} onChange={setFFase} options={faseOptions.map((f) => [f, f === "todas" ? "Todas as fases" : f] as [string, string])} />
        )}
      </div>

      {tab === "oportunidades" ? (
        <Card pad={false}>
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 480 }}>
            <table className="tbl" style={{ minWidth: 760 }}>
              <thead>
                <tr><th>ID</th><th>Cliente</th><th>Coordenação</th><th>Fase</th><th>Origem</th><th className="num">Valor</th></tr>
              </thead>
              <tbody>
                {opps.map((o) => (
                  <tr key={o.id}>
                    <td className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>#{o.id}</td>
                    <td className="muted text-meta-navy-50">{o.cliente ?? "—"}</td>
                    <td>{o.coordenacao_sigla ?? <span className="muted text-meta-navy-50">—</span>}</td>
                    <td><span className="badge badge--info">{o.fase}</span></td>
                    <td className="muted text-meta-navy-50">{o.origem ?? "—"}</td>
                    <td className="num">{o.valor ? BRL(o.valor) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {oportunidades.length > 200 && <div className="muted px-4 py-2 text-[12px] text-meta-navy-50">Exibindo 200 de {oportunidades.length} no período.</div>}
        </Card>
      ) : (
        <div className="grid-mvp cols-3">
          {clientes.slice(0, 30).map((c) => (
            <div key={c.id} className="card card--pad flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="av-circ" style={{ width: 38, height: 38, background: "#22C0FF", fontSize: 13 }}>{c.nome.slice(0, 2).toUpperCase()}</span>
                <div className="text-[15px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{c.nome}</div>
              </div>
              <div className="flex gap-[18px]">
                <div><div className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{c.oportunidades}</div><div className="muted text-[11px] text-meta-navy-50">oportunidades</div></div>
                <div><div className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{c.contratos}</div><div className="muted text-[11px] text-meta-navy-50">contratos</div></div>
                <div className="ml-auto text-right"><div className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{BRL(c.receita)}</div><div className="muted text-[11px] text-meta-navy-50">receita</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
