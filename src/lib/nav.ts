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

/**
 * Represents a single link item in the sidebar navigation.
 * @typedef {Object} NavItem
 * @property {string} href - Path navigation link.
 * @property {string} label - Display name label.
 * @property {LucideIcon} icon - Lucide Icon component class.
 * @property {string} [badge] - Optional status badge text.
 */
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

/**
 * Group wrapper representing a categorized list of navigation links in the sidebar menu.
 * @typedef {Object} NavGroup
 * @property {string} group - Classification category name.
 * @property {NavItem[]} items - Array of navigation items.
 */
export type NavGroup = {
  group: string;
  items: NavItem[];
};

/**
 * Enterprise navigation configuration matching the desktop/mobile sidebar layout hierarchy.
 */
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

/**
 * Map routing paths to breadcrumb display labels.
 */
export const ROUTE_CRUMB: Record<string, string> = {
  "/": "Visão Horizontal",
  "/mapa-pessoas": "Mapa & Pessoas",
  "/projetos": "Projetos Externos",
  "/servicos": "Serviços & Portfólio",
  "/comercial": "Comercial",
  "/financeiro": "Contratos & Financeiro",
  "/analises": "Análises Transversais",
};
