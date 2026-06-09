import type { Metadata } from "next";
import { bduApi } from "@/lib/api/bdu";
import { FinanceiroView } from "./financeiro-view";
import { ErrorState } from "@/components/shared/states";

export const metadata: Metadata = { title: "Contratos & Financeiro" };
export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  let data: Awaited<ReturnType<typeof carregar>>;
  try {
    data = await carregar();
  } catch {
    return (
      <div className="mx-auto max-w-[1480px]">
        <ErrorState title="Não foi possível carregar o financeiro" />
      </div>
    );
  }
  const [contratos, transacoes, fluxo, contas] = data;
  return <FinanceiroView contratos={contratos} transacoes={transacoes} fluxo={fluxo} contas={contas} />;
}

function carregar() {
  return Promise.all([bduApi.contratos(), bduApi.transacoes(), bduApi.fluxo(), bduApi.contas()]);
}
