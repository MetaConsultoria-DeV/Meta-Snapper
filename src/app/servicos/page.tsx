import type { Metadata } from "next";
import { bduApi, type ServicoPortfolioDTO } from "@/lib/api/bdu";
import { PageHeader } from "@/components/page-header";
import { Kpi, Card, SectionTitle } from "@/components/dashboard/primitives";
import { ErrorState } from "@/components/shared/states";
import { Icon } from "@/components/dashboard/icon";

export const metadata: Metadata = { title: "Serviços & Portfólio" };
export const dynamic = "force-dynamic";

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
  let servicos: ServicoPortfolioDTO[];
  try {
    servicos = await bduApi.servicosPortfolio();
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
        {[...grupos.values()].map((co) => {
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

      <div className="grid-mvp mt-6 items-start" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Card title="Demanda por coordenação" sub="Oportunidades com coordenação identificada (Pipefy)">
          <div className="mt-0.5 flex flex-col gap-3">
            {coords.map((c) => (
              <div key={c.sigla} className="flex items-center gap-3">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: cor(c.sigla) }} />
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="font-semibold">{c.nome}</span>
                    <span className="text-meta-navy-50">{c.qtdServicos} serviços</span>
                  </div>
                  <div className="bar bar--thin">
                    <div className="bar__fill" style={{ width: (c.oportunidades / maxOpp) * 100 + "%", background: cor(c.sigla) }} />
                  </div>
                </div>
                <span className="w-9 text-right text-[13px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{c.oportunidades}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Resumo por coordenação" sub="Carteira de serviços e demanda comercial" pad={false}>
          <div className="overflow-x-auto">
            <table className="tbl" style={{ minWidth: 420 }}>
              <thead>
                <tr>
                  <th>Coordenação</th>
                  <th className="text-center">Serviços</th>
                  <th className="text-center">Oportunidades</th>
                </tr>
              </thead>
              <tbody>
                {coords.map((c) => (
                  <tr key={c.sigla}>
                    <td className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ background: cor(c.sigla) }} />
                        {c.nome}
                      </span>
                    </td>
                    <td className="text-center"><span className="badge badge--neutral">{c.qtdServicos}</span></td>
                    <td className="text-center"><span className="badge badge--info">{c.oportunidades}</span></td>
                  </tr>
                ))}
                <tr>
                  <td className="font-bold" style={{ fontFamily: "var(--font-heading)" }}>Total</td>
                  <td className="text-center font-bold">{servicos.length}</td>
                  <td className="text-center font-bold">{demandaTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
