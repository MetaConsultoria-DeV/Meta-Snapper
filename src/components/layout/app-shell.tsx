"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";

/**
 * Shell global da aplicação: Sidebar + TopBar + área de conteúdo.
 * Mantém o estado de UI (sidebar recolhida, período selecionado) no cliente.
 * O período ainda é visual nesta fase; a lógica temporal real entra na Phase 6.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [period, setPeriod] = useState("2026");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          onToggleSidebar={() => setCollapsed((v) => !v)}
          period={period}
          onPeriodChange={setPeriod}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
