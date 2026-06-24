import {
  Home,
  Users,
  FolderKanban,
  Layers,
  Filter,
  Wallet,
  Network,
  FileText,
  Building2,
  Target,
  TriangleAlert,
  Clock,
  DollarSign,
  GitBranch,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  User,
  LayoutGrid,
  Link2,
  Plus,
  Check,
  Calendar,
  Table,
  Zap,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  CircleCheck,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** Mapa nome-do-MVP → componente lucide (espelha referencia-mvp-html/.../icons.jsx). */
const ICONS: Record<string, LucideIcon> = {
  home: Home,
  people: Users,
  projects: FolderKanban,
  services: Layers,
  funnel: Filter,
  finance: Wallet,
  network: Network,
  doc: FileText,
  building: Building2,
  target: Target,
  alert: TriangleAlert,
  clock: Clock,
  dollar: DollarSign,
  branch: GitBranch,
  chevRight: ChevronRight,
  arrowRight: ArrowRight,
  trendUp: TrendingUp,
  trendDown: TrendingDown,
  info: Info,
  user: User,
  grid: LayoutGrid,
  link: Link2,
  plus: Plus,
  check: Check,
  calendar: Calendar,
  table: Table,
  zap: Zap,
  arrowDown: ArrowDown,
  arrowUp: ArrowUp,
  swap: ArrowLeftRight,
  checkCircle: CircleCheck,
  chevDown: ChevronDown,
  filter: Filter,
  sliders: SlidersHorizontal,
  spark: Sparkles,
};

/**
 * A wrapper component to dynamically resolve and render Lucide Icons by name.
 * Falls back to the 'Info' icon if the specified name is not found in the mappings.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.name - The mapped key of the icon to render (e.g. 'home', 'people', 'projects').
 * @param {number} [props.size=18] - Diameter size of the icon element in pixels.
 * @param {string} [props.className] - Optional Tailwind CSS classes or custom styles.
 * @returns {JSX.Element} The resolved Lucide Icon component.
 */
export function Icon({
  name,
  size = 18,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? Info;
  return <Cmp size={size} className={className} />;
}
