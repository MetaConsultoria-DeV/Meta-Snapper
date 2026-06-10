import type { Metadata } from "next";
import { bduApi } from "@/lib/api/bdu";
import { ProjetosView, type ProjetoVM } from "./projetos-view";
import { ErrorState } from "@/components/shared/states";

export const metadata: Metadata = { title: "Projetos Externos" };
export const dynamic = "force-dynamic";

export default async function ProjetosPage() {
  let facts;
  try {
    facts = await bduApi.transversaisFacts();
  } catch {
    return (
      <div className="mx-auto max-w-[1480px]">
        <ErrorState title="Não foi possível carregar os projetos" />
      </div>
    );
  }

  // Agrupa os "fatos" por projeto → view-model do portfólio.
  const map = new Map<number, ProjetoVM>();
  for (const f of facts) {
    let p = map.get(f.projeto_id);
    if (!p) {
      p = {
        id: f.projeto_id,
        nome: f.projeto,
        valor: f.valor ?? 0,
        coord: f.coordenacao ?? "—",
        coordSigla: f.coordenacao_sigla ?? "",
        cliente: f.cliente,
        equipe: [],
        descricao: f.descricao,
        status: (f.status === "finalizado" ? "concluido" : f.status) as "ativo" | "concluido" | "pausado" | undefined,
      };
      map.set(f.projeto_id, p);
    }
    if (f.membro && !p.equipe.includes(f.membro)) p.equipe.push(f.membro);
    if (!p.cliente && f.cliente) p.cliente = f.cliente;
  }
  const projetos = [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome));

  return <ProjetosView projetos={projetos} />;
}
