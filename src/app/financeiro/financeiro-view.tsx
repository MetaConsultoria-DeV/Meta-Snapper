"use client";

import { useState } from "react";
import { BRL } from "@/lib/mock-data";
import type { ContratoDTO, TransacaoDTO, FluxoMesDTO, ContaSaldoDTO } from "@/lib/api/bdu";
import { PageHeader } from "@/components/page-header";
import { Kpi, Card, SectionTitle, Badge, Bar, FlowChain } from "@/components/dashboard/primitives";
import { Icon } from "@/components/dashboard/icon";

function statusParcelas(pagas: number, total: number): { kind: "success" | "info" | "warning"; label: string } {
  if (total > 0 && pagas >= total) return { kind: "success", label: "Quitado" };
  if (pagas === 0) return { kind: "warning", label: "Em aberto" };
  return { kind: "info", label: "Em dia" };
}

export function FinanceiroView({
  contratos,
  transacoes,
  fluxo,
  contas,
}: {
  contratos: ContratoDTO[];
  transacoes: TransacaoDTO[];
  fluxo: FluxoMesDTO[];
  contas: ContaSaldoDTO[];
}) {
  const [fTipo, setFTipo] = useState("todos");
  const txs = transacoes.filter((t) => fTipo === "todos" || t.tipo === fTipo);

  const totalEntradas = fluxo.reduce((s, f) => s + f.entrada, 0);
  const totalSaidas = fluxo.reduce((s, f) => s + f.saida, 0);
  const receita = contratos.reduce((s, c) => s + (c.valor_total ?? 0), 0);
  const maxFluxo = Math.max(...fluxo.flatMap((f) => [f.entrada, f.saida]), 1);
  const parcelasAbertas = contratos.reduce((s, c) => s + Math.max(0, c.parcelas_total - c.parcelas_pagas), 0);

  // saídas por categoria (derivado das transações)
  const catMap = new Map<string, number>();
  for (const t of transacoes) {
    if (t.tipo === "saida") catMap.set(t.categoria ?? "Sem categoria", (catMap.get(t.categoria ?? "Sem categoria") ?? 0) + t.valor);
  }
  const palette = ["#E5484D", "#F5A623", "#7C4DFF", "#131936", "#00B894", "#22C0FF"];
  const catSaidas = [...catMap.entries()].map(([nome, valor], i) => ({ nome, valor, color: palette[i % palette.length] })).sort((a, b) => b.valor - a.valor).slice(0, 6);

  return (
    <div className="mx-auto max-w-[1480px]">
      <PageHeader
        eyebrow="Comercial & Financeiro"
        title="Contratos, Receita & Financeiro"
        description="Leitura integrada entre contratos, clientes e projetos de um lado, e pagamentos, parcelas e transações do outro. De onde vêm e para onde vão os recursos."
      />

      <div className="grid-mvp cols-4 mb-3.5">
        <Kpi icon="doc" label="Receita contratada" value={BRL(receita)} note={`${contratos.length} contratos`} />
        <Kpi icon="arrowDown" label="Entradas" value={BRL(totalEntradas)} note="no período" />
        <Kpi icon="arrowUp" label="Saídas" value={BRL(totalSaidas)} note="no período" />
        <Kpi icon="finance" label="Resultado" value={BRL(totalEntradas - totalSaidas)} note="entradas − saídas" />
      </div>

      <Card pad={true} className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow-mini flex items-center gap-1.5">
            <Icon name="link" size={13} />
            Como o dinheiro se conecta
          </span>
          <FlowChain
            steps={[
              { type: "cliente", label: "Cliente" },
              { type: "contrato", label: "Contrato" },
              { type: "projeto", label: "Projeto" },
              { type: "contrato", label: "Parcelas" },
              { type: "contrato", label: "Transações" },
            ]}
          />
          <span className="muted ml-auto text-[12.5px] text-meta-navy-50">
            {parcelasAbertas} parcelas em aberto · {transacoes.filter((t) => t.tipo === "entrada").length} entradas
          </span>
        </div>
      </Card>

      <SectionTitle icon="doc">Contratos</SectionTitle>
      <Card pad={false} className="mb-2">
        <div className="overflow-x-auto">
          <table className="tbl w-full" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Cliente</th>
                <th>Projeto</th>
                <th>Fase</th>
                <th style={{ width: 140 }}>Parcelas</th>
                <th>Status</th>
                <th className="num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => {
                const st = statusParcelas(c.parcelas_pagas, c.parcelas_total);
                return (
                  <tr key={c.id}>
                    <td className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{c.numero ?? `#${c.id}`}</td>
                    <td className="muted max-w-[160px] truncate text-meta-navy-50" title={c.cliente ?? undefined}>{c.cliente ?? "—"}</td>
                    <td className="muted max-w-[160px] truncate text-meta-navy-50" title={c.projeto ?? undefined}>{c.projeto ?? "—"}</td>
                    <td><span className="tag" style={{ padding: "2px 9px" }}>{c.fase_atual ?? "—"}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Bar value={c.parcelas_total ? (c.parcelas_pagas / c.parcelas_total) * 100 : 0} />
                        <span className="nowrap text-[11.5px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{c.parcelas_pagas}/{c.parcelas_total}</span>
                      </div>
                    </td>
                    <td><Badge kind={st.kind} dot>{st.label}</Badge></td>
                    <td className="num">{BRL(c.valor_total ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle icon="finance">Movimentação financeira</SectionTitle>
      <div className="grid-mvp mb-2" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <Card title="Entradas vs. saídas" sub="Fluxo de caixa mensal">
          <div className="flex items-end gap-[18px] pt-2" style={{ height: 170, overflowX: "auto" }}>
            {fluxo.map((f, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" style={{ minWidth: 40 }}>
                <div className="flex h-full w-full items-end justify-center gap-1.5">
                  <div title={"Entradas " + BRL(f.entrada)} style={{ width: 14, borderRadius: "5px 5px 0 0", height: (f.entrada / maxFluxo) * 120 + "px", background: "#00B894" }} />
                  <div title={"Saídas " + BRL(f.saida)} style={{ width: 14, borderRadius: "5px 5px 0 0", height: (f.saida / maxFluxo) * 120 + "px", background: "#E5484D" }} />
                </div>
                <span className="whitespace-nowrap text-[10px] text-meta-navy-50">{f.mes}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex justify-center gap-4">
            <span className="flex items-center gap-2 text-xs text-meta-navy-50"><span className="size-2.5 rounded-[3px]" style={{ background: "#00B894" }} />Entradas</span>
            <span className="flex items-center gap-2 text-xs text-meta-navy-50"><span className="size-2.5 rounded-[3px]" style={{ background: "#E5484D" }} />Saídas</span>
          </div>
        </Card>
        <Card title="Saídas por categoria" sub="Para onde vão os recursos">
          <div className="mt-0.5 flex flex-col gap-2.5">
            {catSaidas.length ? (
              catSaidas.map((c, i) => {
                const max = catSaidas[0].valor || 1;
                return (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-[12.5px]">
                      <span className="flex items-center gap-2"><span className="size-2.5 rounded-[3px]" style={{ background: c.color }} />{c.nome}</span>
                      <b style={{ fontFamily: "var(--font-heading)" }}>{BRL(c.valor)}</b>
                    </div>
                    <div className="bar bar--thin"><div className="bar__fill" style={{ width: (c.valor / max) * 100 + "%", background: c.color }} /></div>
                  </div>
                );
              })
            ) : (
              <span className="muted text-[13px] text-meta-navy-50">Sem saídas categorizadas no período.</span>
            )}
          </div>
        </Card>
      </div>

      <div className="grid-mvp cols-3 mb-[18px] mt-6">
        {contas.map((c, i) => (
          <div key={i} className="card card--pad">
            <div className="flex items-center gap-3">
              <span className="kpi__ico"><Icon name="building" size={16} /></span>
              <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{c.conta}</span>
            </div>
            <div className="mt-3 text-[22px] font-bold" style={{ fontFamily: "var(--font-heading)", color: c.saldo < 0 ? "#c43338" : "var(--meta-navy)" }}>{BRL(c.saldo)}</div>
            <div className="muted text-[11.5px] text-meta-navy-50">saldo no período</div>
          </div>
        ))}
      </div>

      <SectionTitle icon="swap">Transações</SectionTitle>
      <div className="mb-3.5 flex gap-2">
        {([["todos", "Todas"], ["entrada", "Entradas"], ["saida", "Saídas"]] as [string, string][]).map(([k, l]) => {
          const active = fTipo === k;
          return (
            <button key={k} onClick={() => setFTipo(k)} className="tag cursor-pointer font-semibold" style={{ fontFamily: "var(--font-heading)", background: active ? "var(--meta-navy)" : "#fff", color: active ? "#fff" : "var(--meta-navy-70)", borderColor: active ? "var(--meta-navy)" : "var(--meta-navy-10)" }}>
              {l}
            </button>
          );
        })}
      </div>
      <Card pad={false}>
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 360 }}>
          <table className="tbl" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Conta</th>
                <th>Vínculo</th>
                <th>Data</th>
                <th className="num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id}>
                  <td className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>#{t.id}</td>
                  <td>{t.tipo === "entrada" ? <Badge kind="success" dot>Entrada</Badge> : <Badge kind="danger" dot>Saída</Badge>}</td>
                  <td className="muted text-meta-navy-50">{t.categoria ?? "—"}</td>
                  <td className="muted text-meta-navy-50">{t.conta ?? "—"}</td>
                  <td>{t.projeto ? <span className="epill e-projeto" style={{ padding: "2px 9px" }}><span className="epill__dot" />{t.projeto}</span> : <span className="muted text-meta-navy-50">—</span>}</td>
                  <td className="muted text-meta-navy-50">{t.data ?? "—"}</td>
                  <td className="num" style={{ color: t.tipo === "entrada" ? "#0a8c6f" : "#c43338" }}>{t.tipo === "entrada" ? "+" : "−"}{BRL(t.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
