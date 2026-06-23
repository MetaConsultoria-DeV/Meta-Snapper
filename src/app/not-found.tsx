import Link from "next/link";
import { EmptyState } from "@/components/shared/states";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1480px]">
      <EmptyState
        title="Página não encontrada"
        description="O endereço acessado não existe no BDU. Verifique o link ou volte para a visão geral."
        action={
          <Link href="/" className="btn btn--ghost btn--sm">
            Voltar para a visão geral
          </Link>
        }
      />
    </div>
  );
}
