"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import {
  PERIODO_COOKIE, parsePeriodo, serializePeriodo, type Periodo,
} from "@/lib/periodo";

// O cookie é a fonte de verdade do período (lido também pelos Server Components).
const ouvintes = new Set<() => void>();
const assinar = (cb: () => void) => {
  ouvintes.add(cb);
  return () => void ouvintes.delete(cb);
};
const lerCookie = () =>
  document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${PERIODO_COOKIE}=`))
    ?.slice(PERIODO_COOKIE.length + 1) ?? "";

/**
 * Shell global da aplicação: Sidebar + TopBar + área de conteúdo.
 * Trocar o período grava o cookie e dá router.refresh() para as páginas
 * (Server Components) re-buscarem com o novo recorte.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const raw = useSyncExternalStore(assinar, lerCookie, () => "");
  const periodo = useMemo(() => parsePeriodo(raw ? decodeURIComponent(raw) : null), [raw]);

  const mudarPeriodo = (p: Periodo) => {
    document.cookie =
      `${PERIODO_COOKIE}=${encodeURIComponent(serializePeriodo(p))}; path=/; max-age=31536000; samesite=lax`;
    ouvintes.forEach((cb) => cb());
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          onToggleSidebar={() => setCollapsed((v) => !v)}
          periodo={periodo}
          onPeriodoChange={mudarPeriodo}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
