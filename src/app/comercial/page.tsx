import type { Metadata } from "next";
import { bduApi } from "@/lib/api/bdu";
import { ComercialView } from "./comercial-view";
import { ErrorState } from "@/components/shared/states";
import { periodoAtivo } from "@/lib/periodo-server";
import { periodoLabels, type Periodo } from "@/lib/periodo";

export const metadata: Metadata = { title: "Comercial" };
export const dynamic = "force-dynamic";

const fmtBR = (s?: string) => (s ? s.split("-").reverse().slice(0, 2).join("/") : "");

/** Rótulo legível do período global (o mesmo recorte usado pelo filtro do topo). */
function rotuloPeriodo(p: Periodo): string {
  const L = periodoLabels();
  switch (p.key) {
    case "30d":
      return "Últimos 30 dias";
    case "sem1":
      return `Semestre ${L.sem1}`;
    case "sem2":
      return `Semestre ${L.sem2}`;
    case "ano":
      return `Ano ${L.ano}`;
    case "custom":
      return p.de && p.ate ? `${fmtBR(p.de)}–${fmtBR(p.ate)}` : "Período personalizado";
    default:
      return "Todo o histórico";
  }
}

export default async function ComercialPage() {
  // Recorte global (cookie lido pelos Server Components) — substitui o seletor próprio.
  const { periodo, range } = await periodoAtivo();

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
      periodoLabel={rotuloPeriodo(periodo)}
    />
  );
}
