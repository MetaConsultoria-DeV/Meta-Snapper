"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { PanelLeft, Menu, Search, Calendar, Bell, ChevronRight } from "lucide-react";
import { ROUTE_CRUMB } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { periodoLabels, type Periodo, type PeriodoKey } from "@/lib/periodo";

type TopBarProps = {
  onToggleSidebar: () => void;
  onToggleDrawer?: () => void;
  periodo: Periodo;
  onPeriodoChange: (p: Periodo) => void;
};

/** Páginas onde o recorte global não se aplica (e o porquê, no tooltip). */
const SEM_RECORTE: Record<string, string> = {
  "/mapa-pessoas": "Página estrutural — os dados não têm recorte temporal",
  "/projetos": "Projetos não têm datas confiáveis no banco para recortar",
  "/analises": "Os fatos das análises não têm datas para recortar",
};

const fmtBR = (s?: string) => (s ? s.split("-").reverse().slice(0, 2).join("/") : "…");

export function TopBar({ onToggleSidebar, onToggleDrawer, periodo, onPeriodoChange }: TopBarProps) {
  const pathname = usePathname();
  const crumb = ROUTE_CRUMB[pathname] ?? "BDU";
  const labels = periodoLabels();
  const naoAplica = SEM_RECORTE[pathname];

  const [calAberto, setCalAberto] = useState(false);
  const [de, setDe] = useState(periodo.key === "custom" ? (periodo.de ?? "") : "");
  const [ate, setAte] = useState(periodo.key === "custom" ? (periodo.ate ?? "") : "");

  useEffect(() => {
    if (periodo.key === "custom") {
      setDe(periodo.de ?? "");
      setAte(periodo.ate ?? "");
    }
  }, [periodo.de, periodo.ate, periodo.key]);

  const chips: { key: PeriodoKey; label: string }[] = [
    { key: "30d", label: "30 dias" },
    { key: "sem1", label: labels.sem1 },
    { key: "sem2", label: labels.sem2 },
    { key: "ano", label: labels.ano },
    { key: "tudo", label: "Tudo" },
  ];

  const aplicarCustom = () => {
    // Validar datas
    if (!de || !ate) {
      alert("Informe ambas as datas (de e até)");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(de) || !dateRegex.test(ate)) {
      alert("Formato de data inválido. Use YYYY-MM-DD");
      return;
    }

    if (de > ate) {
      alert("Data inicial não pode ser maior que data final");
      return;
    }

    onPeriodoChange({ key: "custom", de, ate });
    setCalAberto(false);
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-5">
      {/* Mobile hamburger */}
      <button
        onClick={onToggleDrawer}
        title="Abrir navegação"
        className="md:hidden grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        title="Recolher menu"
        className="hidden md:grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
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
        className={cn("relative", naoAplica && "opacity-45")}
        title={naoAplica ?? "Recorte temporal (afeta as leituras com data)"}
      >
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
          <button
            disabled={!!naoAplica}
            onClick={() => setCalAberto((v) => !v)}
            title={naoAplica ?? "Intervalo específico (duas datas)"}
            className={cn(
              "grid size-7 place-items-center rounded-md transition-colors",
              periodo.key === "custom" ? "bg-meta-blue text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Calendar size={15} />
          </button>
          {periodo.key === "custom" && (
            <span className="px-1 text-[11px] font-semibold text-meta-blue">
              {fmtBR(periodo.de)}–{fmtBR(periodo.ate)}
            </span>
          )}
          {chips.map((c) => (
            <button
              key={c.key}
              disabled={!!naoAplica}
              onClick={() => onPeriodoChange({ key: c.key })}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                periodo.key === c.key
                  ? "bg-meta-blue text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {calAberto && !naoAplica && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[260px] rounded-xl border border-border bg-card p-3 shadow-lg">
            <div className="mb-2 text-xs font-semibold text-foreground">Intervalo específico</div>
            <label className="mb-2 block text-[11px] text-muted-foreground">
              De
              <input
                type="date"
                value={de}
                onChange={(e) => setDe(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
              />
            </label>
            <label className="mb-3 block text-[11px] text-muted-foreground">
              Até
              <input
                type="date"
                value={ate}
                onChange={(e) => setAte(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setDe(""); setAte(""); setCalAberto(false); onPeriodoChange({ key: "tudo" }); }}
                className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
              <button
                onClick={aplicarCustom}
                className="rounded-md bg-meta-blue px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                disabled={!de && !ate}
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
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
