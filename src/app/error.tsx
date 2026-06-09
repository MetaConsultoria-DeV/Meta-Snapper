"use client";

import { ErrorState } from "@/components/shared/states";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-[1480px]">
      <ErrorState
        title="Não foi possível carregar esta página"
        description="O backend BDU não respondeu como esperado. Tente novamente em instantes."
        onRetry={reset}
      />
    </div>
  );
}
