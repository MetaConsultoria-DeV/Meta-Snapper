import type { Metadata } from "next";
import { bduApi, type ServicoPortfolioDTO } from "@/lib/api/bdu";
import { PageHeader } from "@/components/page-header";
import { Kpi, Card, SectionTitle } from "@/components/dashboard/primitives";
import { ErrorState } from "@/components/shared/states";
import { Icon } from "@/components/dashboard/icon";
import { periodoAtivo } from "@/lib/periodo-server";

export const metadata: Metadata = { title: "Serviços & Portfólio" };

/** Cores por coordenação (sigla) — paleta de marca, já que a API não traz cor. */
const CORD_COR: Record<string, string> = {
  TD: "#7C4DFF",
  GN: "#0067FF",
  OP: "#00B894",
  DM: "#F5A623",
  CE: "#E5484D",
};
const cor = (sigla: string) => CORD_COR[sigla] ?? "#6B7299";

export default async function ServicosPage() {
  const { range } = await periodoAtivo();
  let servicos: ServicoPortfolioDTO[];
  try {
    servicos = await bduApi.servicosPortfolio(range);
  } catch {
    return (
      <div className="mx-auto max-w-[1480px]">
        <ErrorState title="Não foi possível carregar os serviços" />
      </div>
    );
  }

  // A API conta oportunidades por COORDENAÇÃO (não por serviço): todo serviço de
  // uma coordenação repete o mesmo número, e não existe vínculo serviço↔oportunidade
  // no banco. Por isso agregamos só no nível da coordenação e nunca somamos por
  // serviço — somar inflava o total ~7×.
  const grupos = new Map<string, { nome: string; sigla: string; servicos: ServicoPortfolioDTO[] }>();
  for (const s of servicos) {
    const key = s.coordenacao_sigla;
    if (!grupos.has(key)) grupos.set(key, { nome: s.coordenacao, sigla: key, servicos: [] });
    grupos.get(key)!.servicos.push(s);
  }

  const coords = [...grupos.values()]
    .map((g) => ({
      nome: g.nome,
      sigla: g.sigla,
      qtdServicos: g.servicos.length,
      oportunidades: g.servicos[0]?.oportunidades ?? 0,
    }))
    .sort((a, b) => b.oportunidades - a.oportunidades);

  const demandaTotal = coords.reduce((s, c) => s + c.oportunidades, 0);
  const maxOpp = Math.max(...coords.map((c) => c.oportunidades), 1);
  const topCoord = coords[0];

  // Cards ordenados pela demanda da coordenação (maior primeiro), para leitura consistente.
  const gruposOrdenados = [...grupos.values()].sort(
    (a, b) => (b.servicos[0]?.oportunidades ?? 0) - (a.servicos[0]?.oportunidades ?? 0),
  );

  return (
    <div className="mx-auto max-w-[1480px]">
      <PageHeader
        eyebrow="Estrutura & Operação"
        title="Serviços & Portfólio"
        description="A carta de serviços da Meta organizada pelas coordenações técnicas — e a demanda comercial que chega a cada coordenação."
      />

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

      <SectionTitle icon="branch">Carta de serviços por coordenação</SectionTitle>
      <div className="grid-mvp cols-3 mb-2">
        {gruposOrdenados.map((co) => {
          const opp = co.servicos[0]?.oportunidades ?? 0;
          return (
            <div key={co.sigla} className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-meta-navy-10 px-[18px] py-3.5" style={{ borderTop: "3px solid " + cor(co.sigla) }}>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: cor(co.sigla) }} />
                  <span className="text-sm font-bold" style={{ fontFamily: "var(--font-heading)" }}>{co.nome}</span>
                </div>
                <span className="muted text-[11.5px] text-meta-navy-50">{co.sigla} · {opp} oport.</span>
              </div>
              <div className="p-2">
                {co.servicos.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-[9px] p-2.5">
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

      <SectionTitle icon="target">Demanda por coordenação</SectionTitle>
      <Card sub="Oportunidades comerciais com coordenação identificada (Pipefy) e tamanho da carteira de serviços." pad={false}>
        <div className="overflow-x-auto">
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
                    <div className="bar bar--thin">
                      <div className="bar__fill" style={{ width: (c.oportunidades / maxOpp) * 100 + "%", background: cor(c.sigla) }} />
                    </div>
                  </td>
                  <td className="num">{c.oportunidades}</td>
                  <td className="num">{c.qtdServicos}</td>
                </tr>
              ))}
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
