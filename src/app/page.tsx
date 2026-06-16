import Link from "next/link";
import { bduApi } from "@/lib/api/bdu";
import { periodoAtivo } from "@/lib/periodo-server";
import { BRL } from "@/lib/mock-data";
import { Kpi, Card, SectionTitle } from "@/components/dashboard/primitives";
import { BarChart, Donut } from "@/components/dashboard/charts";
import { ErrorState } from "@/components/shared/states";
import { Icon } from "@/components/dashboard/icon";

export const dynamic = "force-dynamic";

const SISTEMA = (o: Awaited<ReturnType<typeof bduApi.overview>>) => [
  { href: "/mapa-pessoas", icon: "people", label: "Pessoas", val: o.membros, sub: `${o.celulas} células · ${o.coordenacoes} coord.`, color: "#0067FF" },
  { href: "/servicos", icon: "services", label: "Serviços", val: o.servicos, sub: "carta técnica", color: "#E5484D" },
  { href: "/projetos", icon: "projects", label: "Projetos", val: o.projetos, sub: "no portfólio", color: "#F5A623" },
  { href: "/comercial", icon: "building", label: "Clientes", val: o.clientes, sub: `${o.oportunidades_abertas} oport. abertas`, color: "#22C0FF" },
  { href: "/financeiro", icon: "doc", label: "Contratos", val: o.contratos, sub: BRL(o.receita_contratada), color: "#7C4DFF" },
  { href: "/financeiro", icon: "finance", label: "Financeiro", val: BRL(o.resultado), sub: "resultado no período", color: "#00B894", wide: true },
];

export default async function HomePage() {
  const { range } = await periodoAtivo();
  let o: Awaited<ReturnType<typeof bduApi.overview>>;
  let celulas: Awaited<ReturnType<typeof bduApi.celulas>>;
  try {
    [o, celulas] = await Promise.all([bduApi.overview(range), bduApi.celulas()]);
  } catch {
    return (
      <div className="mx-auto max-w-[1480px]">
        <ErrorState
          title="Não foi possível carregar a visão geral"
          description="O backend BDU não respondeu. Verifique a API e tente novamente."
        />
      </div>
    );
  }

  const systemNodes = SISTEMA(o);
  const entradasPct =
    o.total_entradas + o.total_saidas > 0
      ? Math.round((o.total_entradas / (o.total_entradas + o.total_saidas)) * 100)
      : 0;

  const celulaBars = [...celulas]
    .sort((a, b) => b.membros - a.membros)
    .map((c) => ({ label: c.sigla, value: c.membros, color: "var(--meta-blue)" }));

  const sinais = [
    { kind: "info", icon: "funnel", t: `${o.oportunidades_abertas} oportunidades abertas`, d: "Em andamento no funil comercial — acompanhe a conversão.", to: "/comercial" },
    { kind: o.resultado >= 0 ? "info" : "danger", icon: "finance", t: `Resultado ${BRL(o.resultado)}`, d: "Entradas menos saídas no período consolidado.", to: "/financeiro" },
    { kind: "warning", icon: "doc", t: `${o.contratos} contratos`, d: `Receita contratada de ${BRL(o.receita_contratada)}.`, to: "/financeiro" },
    { kind: "info", icon: "branch", t: `${o.membros} membros em ${o.celulas} células`, d: "Estrutura distribuída entre células e coordenações.", to: "/mapa-pessoas" },
  ];
  const sinalStyle: Record<string, { bg: string; fg: string }> = {
    danger: { bg: "rgba(229,72,77,.12)", fg: "#c43338" },
    warning: { bg: "rgba(245,166,35,.14)", fg: "#b9760a" },
    info: { bg: "rgba(0,103,255,.1)", fg: "var(--meta-blue)" },
  };

  const glowClasses: Record<string, string> = {
    "Pessoas": "flow-glow-pessoas",
    "Serviços": "flow-glow-servicos",
    "Projetos": "flow-glow-projetos",
    "Clientes": "flow-glow-clientes",
    "Contratos": "flow-glow-contratos",
    "Financeiro": "flow-glow-financeiro"
  };

  return (
    <div className="mx-auto max-w-[1480px] px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
      {/* HERO */}
      <div className="mb-6 overflow-hidden rounded-[18px] text-white hero-premium-bg">
        <div className="relative px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-8">
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="w-full md:max-w-[620px]">
              <div className="eyebrow mb-2.5 text-meta-blue-accent" style={{ color: "#22c0ff" }}>Síntese institucional</div>
              <h1 className="text-2xl md:text-3xl lg:text-[36px] font-bold leading-tight tracking-tight">
                Como está a Meta <span className="text-meta-gradient">hoje</span>.
              </h1>
              <p className="mt-3 text-sm md:text-[15.5px] leading-relaxed text-meta-navy-30" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Uma leitura única da empresa como sistema conectado — pessoas, projetos, comercial e
                financeiro lidos juntos, não em silos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
              {[
                { v: o.membros, l: "membros" },
                { v: o.projetos, l: "projetos" },
                { v: o.oportunidades_abertas, l: "oport. abertas" },
              ].map((s, i) => (
                <div key={i} className="glass-stat-card flex-1 md:flex-none min-w-[100px] md:min-w-[105px]">
                  <div className="text-xl md:text-2xl lg:text-[34px] font-extrabold leading-none tracking-tight text-white">{s.v}</div>
                  <div className="mt-1 text-[10px] md:text-[11px] font-semibold text-meta-navy-30 uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-mvp cols-4">
        <Kpi icon="doc" label="Receita contratada" value={BRL(o.receita_contratada)} note={`${o.contratos} contratos`} className="kpi-premium kpi-contratos" />
        <Kpi icon="finance" label="Resultado no período" value={BRL(o.resultado)} note="entradas − saídas" className="kpi-premium kpi-finance" />
        <Kpi icon="target" label="Ticket médio" value={BRL(o.ticket_medio)} note="por contrato" className="kpi-premium" />
        <Kpi icon="building" label="Clientes" value={o.clientes} note={`${o.oportunidades_abertas} oport. abertas`} className="kpi-premium kpi-clientes" />
      </div>

      {/* SISTEMA CONECTADO */}
      <SectionTitle icon="network">A Meta como sistema conectado</SectionTitle>
      <div className="card card--pad px-4 md:px-6 lg:px-[22px] py-4 md:py-6 lg:py-[22px]">
        <p className="muted mb-4 md:mb-6 w-full md:max-w-[760px] text-xs md:text-sm lg:text-[13.5px] text-meta-navy-50">
          Cada bloco é uma porta de entrada. O fluxo lê-se da esquerda para a direita:{" "}
          <b className="text-meta-navy">
            quem somos → o que oferecemos → o que entregamos → para quem → sob qual contrato → com qual
            impacto financeiro.
          </b>{" "}
          Clique para navegar.
        </p>
        <div className="flex items-stretch gap-0 overflow-x-auto overflow-y-hidden pt-2 pb-3 -mx-4 md:-mx-6 lg:-mx-[22px] px-4 md:px-6 lg:px-[22px]">
          {systemNodes.map((n, i) => {
            const glowCls = glowClasses[n.label] || "";
            return (
              <div key={i} className="flex items-stretch" style={{ flex: n.wide ? 1.4 : 1 }}>
                <Link
                  href={n.href}
                  className={`card-flow-node flex min-w-[120px] md:min-w-[135px] flex-1 flex-col gap-2 md:gap-3 p-3 md:p-4 border-t-4 ${glowCls}`}
                  style={{ borderTopColor: n.color }}
                >
                  <div>
                    <span className="grid size-8 md:size-9 place-items-center rounded-[10px] mb-1.5 md:mb-2" style={{ background: n.color + "16", color: n.color }}>
                      <Icon name={n.icon} size={16} />
                    </span>
                    <div className="font-bold leading-none tracking-tight text-meta-navy text-lg md:text-xl lg:text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
                      {n.val}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs md:text-sm lg:text-[13.5px] font-semibold text-meta-navy" style={{ fontFamily: "var(--font-heading)" }}>
                      {n.label}
                    </div>
                    <div className="muted text-[10px] md:text-[11px] text-meta-navy-50 mt-0.5">{n.sub}</div>
                  </div>
                </Link>
                {i < systemNodes.length - 1 && (
                  <div className="arrow-connector px-1 md:px-1.5">
                    <Icon name="chevRight" size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SINAIS + PAINÉIS */}
      <div className="grid-mvp cols-3 mt-4 md:mt-6 lg:mt-6 items-stretch">
        <Card title="Sinais que merecem atenção" sub="Leitura de números consolidados" className="flex flex-col justify-between">
          <div className="mt-1 flex flex-col gap-2 md:gap-2.5 flex-grow justify-center">
            {sinais.map((s, i) => (
              <Link key={i} href={s.to} className="flex items-start gap-3 rounded-xl border border-meta-navy-10 px-3 md:px-3.5 py-2.5 md:py-3 transition-colors signal-card-hover min-h-[44px]">
                <span className="grid size-8 md:size-[34px] shrink-0 place-items-center rounded-[9px] flex-shrink-0" style={{ background: sinalStyle[s.kind].bg, color: sinalStyle[s.kind].fg }}>
                  <Icon name={s.icon} size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs md:text-sm font-semibold text-meta-navy" style={{ fontFamily: "var(--font-heading)" }}>{s.t}</div>
                  <div className="muted mt-0.5 text-[11px] md:text-[12.5px] leading-snug text-meta-navy-50">{s.d}</div>
                </div>
                <Icon name="chevRight" size={14} className="mt-1 md:mt-2 text-meta-navy-30 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Membros por célula" className="flex flex-col justify-between overflow-hidden">
          <div className="flex-grow flex items-center justify-center py-2 md:py-0">
            <BarChart data={celulaBars} height={140} />
          </div>
        </Card>

        <Card title="Fluxo de caixa" sub="Entradas vs. saídas no período" className="flex flex-col justify-between">
          <div className="flex-grow flex items-center justify-center">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-[18px] w-full">
              <Donut
                size={100}
                thickness={14}
                segments={[
                  { value: o.total_entradas, color: "#00B894" },
                  { value: o.total_saidas, color: "#E5484D" },
                ]}
                center={
                  <div className="text-center">
                    <div className="font-extrabold tracking-tight text-sm md:text-base" style={{ fontFamily: "var(--font-heading)" }}>{entradasPct}%</div>
                    <div className="text-[9px] md:text-[10px] text-meta-navy-50">entradas</div>
                  </div>
                }
              />
              <div className="flex flex-row md:flex-col gap-4 md:gap-3 w-full md:w-auto">
                <div className="flex-1 md:flex-none">
                  <div className="flex items-center gap-2 text-[11px] md:text-[12.5px] text-meta-navy-50">
                    <span className="size-2 md:size-2.5 rounded-[3px]" style={{ background: "#00B894" }} />Entradas
                  </div>
                  <div className="text-base md:text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "#0a8c6f" }}>{BRL(o.total_entradas)}</div>
                </div>
                <div className="flex-1 md:flex-none">
                  <div className="flex items-center gap-2 text-[11px] md:text-[12.5px] text-meta-navy-50">
                    <span className="size-2 md:size-2.5 rounded-[3px]" style={{ background: "#E5484D" }} />Saídas
                  </div>
                  <div className="text-base md:text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "#c43338" }}>{BRL(o.total_saidas)}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
