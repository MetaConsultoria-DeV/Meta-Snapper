import { LoadingState } from "@/components/shared/states";

/**
 * Fallback de streaming herdado por todas as rotas: o router mostra este
 * skeleton instantaneamente enquanto o Server Component da página busca os dados.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1480px]">
      <LoadingState label="Carregando…" rows={6} />
    </div>
  );
}
