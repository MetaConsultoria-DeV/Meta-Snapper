import type { Metadata } from "next";
import { bduApi, type ServicoPortfolioDTO } from "@/lib/api/bdu";
import { PageHeader } from "@/components/page-header";
import { Kpi, Card, SectionTitle } from "@/components/dashboard/primitives";
import { ErrorState } from "@/components/shared/states";
import { Icon } from "@/components/dashboard/icon";
import { periodoAtivo } from "@/lib/periodo-server";

export const metadata: Metadata = { title: "Serviços & Portfólio" };

/**
 * Brand color palette mapped by technical coordination acronyms.
 * Used since the API does not return color values for coordinations.
 * @type {Record<string, string>}
 */
const CORD_COR: Record<string, string> = {
  TD: "#7C4DFF", // Tecnologia & Desenvolvimento
  GN: "#0067FF", // Gestão & Negócios
  OP: "#00B894", // Operações
  DM: "#F5A623", // Desenvolvimento de Membros
  CE: "#E5484D", // Comercial & Estratégia
};

/**
 * Returns the matching color code for a coordination acronym or falls back to a neutral gray.
 *
 * @function cor
 * @param {string} sigla - The coordination acronym.
 * @returns {string} The hex color code.
 */
const cor = (sigla: string) => CORD_COR[sigla] ?? "#6B7299";

/**
 * ServicosPage Component (Server Component)
 * Fetches services and their associated demand for the currently active period.
 * Performs grouping by coordination to avoid inflating total commercial demands.
 * Displays page header, top operational KPIs, services directory, and demand comparison table.
 *
 * @component
 */
export default async function ServicosPage() {
  // Fetch active period range from server configuration
  const { range } = await periodoAtivo();
  let servicos: ServicoPortfolioDTO[];

  try {
    servicos = await bduApi.servicosPortfolio(range);
  } catch {
    return (
      /* Center container for error message if API fails */
      <div className="mx-auto max-w-[1480px]">
        <ErrorState title="Não foi possível carregar os serviços" />
      </div>
    );
  }

  // AGGREGATION LOGIC:
  // The API counts opportunities per COORDINATION (not per service): every service under
  // a coordination repeats the exact same number, and there is no direct service<->opportunity
  // association in the database. Hence, we group only at the coordination level and never sum
  // by service. Summing by service would inflate the total roughly 7x.
  const grupos = new Map<string, { nome: string; sigla: string; servicos: ServicoPortfolioDTO[] }>();
  for (const s of servicos) {
    const key = s.coordenacao_sigla;
    if (!grupos.has(key)) grupos.set(key, { nome: s.coordenacao, sigla: key, servicos: [] });
    grupos.get(key)!.servicos.push(s);
  }

  // Map grouped map entries to coordination stats arrays and sort by demand (descending)
  const coords = [...grupos.values()]
    .map((g) => ({
      nome: g.nome,
      sigla: g.sigla,
      qtdServicos: g.servicos.length,
      oportunidades: g.servicos[0]?.oportunidades ?? 0,
    }))
    .sort((a, b) => b.oportunidades - a.oportunidades);

  // Compute total commercial demand sum
  const demandaTotal = coords.reduce((s, c) => s + c.oportunidades, 0);
  // Find highest demand to scale the progress bars accordingly
  const maxOpp = Math.max(...coords.map((c) => c.oportunidades), 1);
  // Get coordination with highest commercial demand
  const topCoord = coords[0];

  // Sort groups by coordination demand (descending) for consistent reading in UI cards
  const gruposOrdenados = [...grupos.values()].sort(
    (a, b) => (b.servicos[0]?.oportunidades ?? 0) - (a.servicos[0]?.oportunidades ?? 0),
  );

  return (
    <div className="mx-auto max-w-[1480px]">
      {/* Page description header */}
      <PageHeader
        eyebrow="Estrutura & Operação"
        title="Serviços & Portfólio"
        description="A carta de serviços da Meta organizada pelas coordenações técnicas — e a demanda comercial que chega a cada coordenação."
      />

      {/* KPI Stats Grid - Responsiveness: 3 columns */}
      <div className="grid-mvp cols-3 mb-[22px]">
        <Kpi icon="services" label="Serviços no portfólio" value={servicos.length} note={`${coords.length} coordenações`} />
        <Kpi icon="target" label="Demanda comercial" value={demandaTotal} note="oportunidades com coordenação" />
        <Kpi
          icon="funnel"
          label="Coordenação mais demandada"
          value={topCoord?.nome ?? "—"}
          note={`${topCoord?.oportunidades ?? 0} oportunidades`}
        />
      </div>

      {/* Title section for the services catalog list */}
      <SectionTitle icon="branch">Carta de serviços por coordenação</SectionTitle>
      {/* Responsive layout: 3-column card grid */}
      <div className="grid-mvp cols-3 mb-2">
        {gruposOrdenados.map((co) => {
          const opp = co.servicos[0]?.oportunidades ?? 0;
          return (
            <div key={co.sigla} className="card overflow-hidden">
              {/* Card Header with top coordination accent line */}
              <div className="flex items-center justify-between border-b border-meta-navy-10 px-[18px] py-3.5" style={{ borderTop: "3px solid " + cor(co.sigla) }}>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: cor(co.sigla) }} />
                  <span className="text-sm font-bold" style={{ fontFamily: "var(--font-heading)" }}>{co.nome}</span>
                </div>
                <span className="muted text-[11.5px] text-meta-navy-50">{co.sigla} · {opp} oport.</span>
              </div>
              {/* Card Body - list of services */}
              <div className="p-2">
                {co.servicos.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-[9px] p-2.5">
                    {/* Icon container with translucent background color */}
                    <span className="grid size-[30px] shrink-0 place-items-center rounded-lg" style={{ background: cor(co.sigla) + "18", color: cor(co.sigla) }}>
                      <Icon name="services" size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{s.nome}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Demand list comparison table */}
      <SectionTitle icon="target">Demanda por coordenação</SectionTitle>
      <Card sub="Oportunidades comerciais com coordenação identificada (Pipefy) e tamanho da carteira de serviços." pad={false}>
        <div className="overflow-x-auto">
          {/* Scrollable table structure */}
          <table className="tbl" style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th>Coordenação</th>
                <th style={{ width: "42%" }}>Demanda</th>
                <th className="num">Oportunidades</th>
                <th className="num">Serviços</th>
              </tr>
            </thead>
            <tbody>
              {/* Detailed row for each technical coordination */}
              {coords.map((c) => (
                <tr key={c.sigla}>
                  <td className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                    <span className="inline-flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: cor(c.sigla) }} />
                      {c.nome}
                      <span className="font-normal text-meta-navy-50">{c.sigla}</span>
                    </span>
                  </td>
                  <td>
                    {/* Visual relative ratio bar chart fill */}
                    <div className="bar bar--thin">
                      <div className="bar__fill" style={{ width: (c.oportunidades / maxOpp) * 100 + "%", background: cor(c.sigla) }} />
                    </div>
                  </td>
                  <td className="num">{c.oportunidades}</td>
                  <td className="num">{c.qtdServicos}</td>
                </tr>
              ))}
              {/* Total Summary Row */}
              <tr>
                <td className="font-bold" style={{ fontFamily: "var(--font-heading)" }}>Total</td>
                <td />
                <td className="num font-bold">{demandaTotal}</td>
                <td className="num font-bold">{servicos.length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
