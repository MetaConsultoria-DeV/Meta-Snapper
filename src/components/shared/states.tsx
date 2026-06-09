import type { ReactNode } from "react";
import { Icon } from "@/components/dashboard/icon";

/** Estado de carregamento — skeleton genérico no padrão visual do BDU. */
export function LoadingState({ label = "Carregando…", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className="card card--pad" role="status" aria-busy="true">
      <div className="mb-4 text-[13px] text-meta-navy-50">{label}</div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded-md bg-meta-navy-10" style={{ width: `${90 - i * 12}%` }} />
        ))}
      </div>
    </div>
  );
}

/** Estado vazio — quando a consulta retorna sem dados. */
export function EmptyState({ title = "Nada por aqui", description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return (
    <div className="card card--pad flex flex-col items-center gap-3 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-meta-navy-10 text-meta-navy-50">
        <Icon name="info" size={22} />
      </span>
      <div className="text-[15px] font-semibold text-meta-navy" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </div>
      {description && <p className="max-w-sm text-[13px] text-meta-navy-50">{description}</p>}
      {action}
    </div>
  );
}

/** Estado de erro — falha ao consultar a API. */
export function ErrorState({ title = "Não foi possível carregar", description, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="card card--pad flex flex-col items-center gap-3 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full" style={{ background: "rgba(229,72,77,.12)", color: "#c43338" }}>
        <Icon name="alert" size={22} />
      </span>
      <div className="text-[15px] font-semibold text-meta-navy" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </div>
      {description && <p className="max-w-sm text-[13px] text-meta-navy-50">{description}</p>}
      {onRetry && (
        <button className="btn btn--ghost btn--sm" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
