"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { Drawer } from "./drawer";
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
 * Global application layout shell.
 * Renders the responsive menus Sidebar, mobile drawer overlay, top Header (TopBar), and scrollable content canvas.
 * Manages global temporal states via cookie mutations and page revalidation requests.
 *
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Route view component to render inside the main canvas.
 * @returns {JSX.Element} The rendered global layout structure.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const raw = useSyncExternalStore(assinar, lerCookie, () => "");
  const periodo = useMemo(() => parsePeriodo(raw ? decodeURIComponent(raw) : null), [raw]);

  // A tela de login não usa o shell (sidebar/topbar) — renderiza só o conteúdo.
  if (pathname === "/login") return <>{children}</>;

  const mudarPeriodo = (p: Periodo) => {
    document.cookie =
      `${PERIODO_COOKIE}=${encodeURIComponent(serializePeriodo(p))}; path=/; max-age=31536000; samesite=lax`;
    ouvintes.forEach((cb) => cb());
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar collapsed={false} />
      </Drawer>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onToggleDrawer={() => setDrawerOpen((v) => !v)}
          periodo={periodo}
          onPeriodoChange={mudarPeriodo}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
