import type { Metadata } from "next";
import { bduApi } from "@/lib/api/bdu";
import { AnalisesView } from "./analises-view";
import { ErrorState } from "@/components/shared/states";

export const metadata: Metadata = { title: "Análises Transversais" };
export const dynamic = "force-dynamic";

export default async function AnalisesPage() {
  let facts: Awaited<ReturnType<typeof bduApi.transversaisFacts>>;
  try {
    facts = await bduApi.transversaisFacts();
  } catch {
    return (
      <div className="mx-auto max-w-[1480px]">
        <ErrorState title="Não foi possível carregar as análises" />
      </div>
    );
  }
  return <AnalisesView facts={facts} />;
}
