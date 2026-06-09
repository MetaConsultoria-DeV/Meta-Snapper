"use client";

import { usePathname } from "next/navigation";
import { PanelLeft, Search, Calendar, Bell, ChevronRight } from "lucide-react";
import { ROUTE_CRUMB } from "@/lib/nav";
import { cn } from "@/lib/utils";

const PERIODS = ["30 dias", "Trimestre", "2026", "Tudo"];

type TopBarProps = {
  onToggleSidebar: () => void;
  period: string;
  onPeriodChange: (period: string) => void;
};

export function TopBar({ onToggleSidebar, period, onPeriodChange }: TopBarProps) {
  const pathname = usePathname();
  const crumb = ROUTE_CRUMB[pathname] ?? "BDU";

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-5">
      <button
        onClick={onToggleSidebar}
        title="Recolher menu"
        className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
      >
        <PanelLeft size={18} />
      </button>

      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-muted-foreground">BDU</span>
        <ChevronRight size={14} className="text-muted-foreground/60" />
        <span className="font-semibold text-foreground">{crumb}</span>
      </div>

      <div className="flex-1" />

      <button className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-meta-blue/40 md:flex">
        <Search size={16} />
        <span>Buscar entidade — pessoa, projeto, cliente…</span>
        <kbd className="ml-2 rounded border border-border bg-secondary px-1.5 text-[11px]">⌘K</kbd>
      </button>

      <div
        className="flex items-center gap-1 rounded-lg border border-border bg-background p-1"
        title="Recorte temporal (afeta toda a leitura)"
      >
        <span className="grid size-7 place-items-center text-muted-foreground">
          <Calendar size={15} />
        </span>
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              period === p
                ? "bg-meta-blue text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        title="Notificações"
        className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
      >
        <Bell size={18} />
      </button>
    </header>
  );
}
