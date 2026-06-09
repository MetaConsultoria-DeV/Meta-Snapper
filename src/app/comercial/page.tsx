import type { Metadata } from "next";
import { bduApi } from "@/lib/api/bdu";
import { ComercialView } from "./comercial-view";
import { ErrorState } from "@/components/shared/states";

export const metadata: Metadata = { title: "Comercial" };
export const dynamic = "force-dynamic";

type PeriodoKey = "ano" | "trimestre" | "30d" | "tudo";
const PERIODO_LABEL: Record<PeriodoKey, string> = {
  ano: "Ano atual",
  trimestre: "Últimos 90 dias",
  "30d": "Últimos 30 dias",
  tudo: "Todo o histórico",
};

function intervalo(periodo: PeriodoKey): { data_inicio?: string; data_fim?: string } {
  const hoje = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (periodo === "tudo") return {};
  if (periodo === "ano") return { data_inicio: `${hoje.getFullYear()}-01-01` };
  const dias = periodo === "30d" ? 30 : 90;
  const ini = new Date(hoje);
  ini.setDate(ini.getDate() - dias);
  return { data_inicio: iso(ini), data_fim: iso(hoje) };
}

export default async function ComercialPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const sp = await searchParams;
  // Período padrão seguro: ano atual (evita dados antigos distorcerem a leitura).
  const periodo: PeriodoKey = (["ano", "trimestre", "30d", "tudo"] as const).includes(sp.periodo as PeriodoKey)
    ? (sp.periodo as PeriodoKey)
    : "ano";
  const range = intervalo(periodo);

  let data: [
    Awaited<ReturnType<typeof bduApi.funil>>,
    Awaited<ReturnType<typeof bduApi.oportunidades>>,
    Awaited<ReturnType<typeof bduApi.origens>>,
    Awaited<ReturnType<typeof bduApi.motivosPerda>>,
    Awaited<ReturnType<typeof bduApi.clientesComercial>>,
  ];
  try {
    data = await Promise.all([
      bduApi.funil(range),
      bduApi.oportunidades(range),
      bduApi.origens(),
      bduApi.motivosPerda(),
      bduApi.clientesComercial(),
    ]);
  } catch {
    return (
      <div className="mx-auto max-w-[1480px]">
        <ErrorState title="Não foi possível carregar o comercial" />
      </div>
    );
  }
  const [funil, oportunidades, origens, motivosPerda, clientes] = data;
  return (
    <ComercialView
      funil={funil}
      oportunidades={oportunidades}
      origens={origens}
      motivosPerda={motivosPerda}
      clientes={clientes}
      periodo={periodo}
      periodoLabel={PERIODO_LABEL[periodo]}
    />
  );
}
