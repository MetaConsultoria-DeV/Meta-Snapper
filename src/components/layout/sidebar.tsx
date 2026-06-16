"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        "hidden md:flex",
        collapsed ? "md:w-[76px]" : "md:w-[260px]",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-5">
        {collapsed ? (
          <Image src="/brand/symbol.svg" alt="Meta" width={28} height={28} priority />
        ) : (
          <Image
            src="/brand/lockup-dark.png"
            alt="Meta Consultoria"
            width={150}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV.map((section) => (
          <div key={section.group} className="mb-5">
            {!collapsed && (
              <div className="eyebrow px-2 py-2 text-[10px] text-sidebar-foreground/50">
                {section.group}
              </div>
            )}
            {section.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-11",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="rounded-full bg-meta-blue/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-meta-blue-accent">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
