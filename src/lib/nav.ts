import {
  Home,
  Users,
  FolderKanban,
  Layers,
  Filter,
  Wallet,
  Network,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroup = {
  group: string;
  items: NavItem[];
};

/** Estrutura de navegação espelhada do MVP (shell.jsx → NAV). */
export const NAV: NavGroup[] = [
  {
    group: "Visão geral",
    items: [{ href: "/", label: "Visão Horizontal", icon: Home }],
  },
  {
    group: "Estrutura & Operação",
    items: [
      { href: "/mapa-pessoas", label: "Mapa & Pessoas", icon: Users },
      { href: "/projetos", label: "Projetos Externos", icon: FolderKanban },
      { href: "/servicos", label: "Serviços & Portfólio", icon: Layers },
    ],
  },
  {
    group: "Comercial & Financeiro",
    items: [
      { href: "/comercial", label: "Comercial", icon: Filter, badge: "fluxo" },
      { href: "/financeiro", label: "Contratos & Financeiro", icon: Wallet },
    ],
  },
  {
    group: "Inteligência",
    items: [
      { href: "/analises", label: "Análises Transversais", icon: Network, badge: "BDU" },
    ],
  },
];

/** Mapa rota → breadcrumb. */
export const ROUTE_CRUMB: Record<string, string> = {
  "/": "Visão Horizontal",
  "/mapa-pessoas": "Mapa & Pessoas",
  "/projetos": "Projetos Externos",
  "/servicos": "Serviços & Portfólio",
  "/comercial": "Comercial",
  "/financeiro": "Contratos & Financeiro",
  "/analises": "Análises Transversais",
};
