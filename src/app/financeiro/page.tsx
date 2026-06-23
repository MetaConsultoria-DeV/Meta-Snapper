import type { Metadata } from "next";
import { bduApi } from "@/lib/api/bdu";
import { periodoAtivo } from "@/lib/periodo-server";
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

async function carregar() {
  const { range } = await periodoAtivo();
  return Promise.all([
    bduApi.contratos(range),
    bduApi.transacoes(range),
    bduApi.fluxo(range),
    bduApi.contas(range),
  ]);
}
