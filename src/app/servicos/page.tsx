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

  const totalOpp = servicos.reduce((s, x) => s + x.oportunidades, 0);
  const totalProj = servicos.reduce((s, x) => s + x.projetos, 0);
  const maxOpp = Math.max(...servicos.map((s) => s.oportunidades), 1);
  const ranking = [...servicos].sort((a, b) => b.oportunidades + b.projetos * 2 - (a.oportunidades + a.projetos * 2));

  // agrupa por coordenação
  const grupos = new Map<string, { nome: string; sigla: string; servicos: ServicoPortfolioDTO[] }>();
  for (const s of servicos) {
    const key = s.coordenacao_sigla;
    if (!grupos.has(key)) grupos.set(key, { nome: s.coordenacao, sigla: key, servicos: [] });
    grupos.get(key)!.servicos.push(s);
  }

  return (
    <div className="mx-auto max-w-[1480px]">
      <PageHeader
        eyebrow="Estrutura & Operação"
        title="Serviços & Portfólio"
        description="A carta de serviços da Meta organizada pelas coordenações técnicas — e como o portfólio se conecta ao comercial (oportunidades) e à entrega (projetos)."
      />

      <div className="grid-mvp cols-4 mb-[22px]">
        <Kpi icon="services" label="Serviços no portfólio" value={servicos.length} note={`${grupos.size} coordenações`} />
        <Kpi icon="target" label="Oportunidades vinculadas" value={totalOpp} note="demanda comercial" />
        <Kpi icon="projects" label="Projetos com serviço" value={totalProj} note="em entrega" />
        <Kpi icon="zap" label="Serviço mais demandado" value={ranking[0]?.nome.split(" ")[0] ?? "—"} note={`${ranking[0]?.oportunidades ?? 0} oportunidades`} />
      </div>

      <SectionTitle icon="branch">Carta de serviços por coordenação</SectionTitle>
      <div className="grid-mvp cols-3 mb-2">
        {[...grupos.values()].map((co) => (
          <div key={co.sigla} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-meta-navy-10 px-[18px] py-3.5" style={{ borderTop: "3px solid " + cor(co.sigla) }}>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: cor(co.sigla) }} />
                <span className="text-sm font-bold" style={{ fontFamily: "var(--font-heading)" }}>{co.nome}</span>
              </div>
              <span className="muted text-[11.5px] text-meta-navy-50">{co.sigla}</span>
            </div>
            <div className="p-2">
              {co.servicos.map((s) => (
                <div key={s.id} className="flex cursor-pointer items-center gap-3 rounded-[9px] p-2.5 transition-colors hover:bg-meta-paper">
                  <span className="grid size-[30px] shrink-0 place-items-center rounded-lg" style={{ background: cor(co.sigla) + "18", color: cor(co.sigla) }}>
                    <Icon name="services" size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{s.nome}</div>
                    <div className="muted text-[11px] text-meta-navy-50">{s.oportunidades} oport. · {s.projetos} projetos</div>
                  </div>
                  <Icon name="chevRight" size={15} className="text-meta-navy-30" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-mvp mt-6 items-start" style={{ gridTemplateColumns: "1fr 1.3fr" }}>
        <Card title="Serviços mais presentes" sub="Demanda comercial + entrega">
          <div className="mt-0.5 flex flex-col gap-3">
            {ranking.slice(0, 7).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-5 text-[13px] font-bold text-meta-navy-30" style={{ fontFamily: "var(--font-heading)" }}>{i + 1}</span>
                <div className="flex-1">
                  <div className="mb-1 text-[13px] font-semibold">{s.nome}</div>
                  <div className="bar bar--thin">
                    <div className="bar__fill" style={{ width: (s.oportunidades / maxOpp) * 100 + "%" }} />
                  </div>
                </div>
                <span className="w-7 text-right text-[13px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>{s.oportunidades}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Portfólio conectado" sub="Como cada serviço atravessa comercial e entrega" pad={false}>
          <div className="overflow-x-auto">
            <table className="tbl" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Coordenação</th>
                  <th className="text-center">Oportunidades</th>
                  <th className="text-center">Projetos</th>
                </tr>
              </thead>
              <tbody>
                {servicos.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{s.nome}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                        <span className="size-2 rounded-full" style={{ background: cor(s.coordenacao_sigla) }} />
                        {s.coordenacao_sigla}
                      </span>
                    </td>
                    <td className="text-center"><span className="badge badge--info">{s.oportunidades}</span></td>
                    <td className="text-center"><span className="badge badge--neutral">{s.projetos}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
