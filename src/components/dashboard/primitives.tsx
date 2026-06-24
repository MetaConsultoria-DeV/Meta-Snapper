import { Fragment, type ReactNode, type CSSProperties } from "react";
import { Icon } from "./icon";

/* ---- KPI tile ---- */
/**
 * Renders a key performance indicator (KPI) tile containing metrics, titles, trend direction, and icons.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.icon] - Optional Lucide icon name.
 * @param {string} props.label - KPI description/title.
 * @param {ReactNode} props.value - Consolidated metric value to display.
 * @param {string} [props.unit] - Optional unit of measurement (e.g. "%", "membros").
 * @param {"up" | "down" | "flat"} [props.trend] - Direction of change.
 * @param {string} [props.trendVal] - Value label explaining the trend.
 * @param {string} [props.note] - Subtext explanation.
 * @param {string} [props.className] - Optional custom CSS className.
 * @returns {JSX.Element} The rendered KPI Card.
 */
export function Kpi({
  icon,
  label,
  value,
  unit,
  trend,
  trendVal,
  note,
  className = "",
}: {
  icon?: string;
  label: string;
  value: ReactNode;
  unit?: string;
  trend?: "up" | "down" | "flat";
  trendVal?: string;
  note?: string;
  className?: string;
}) {
  const tcls = trend === "up" ? "trend--up" : trend === "down" ? "trend--down" : "trend--flat";
  const ticon = trend === "up" ? "trendUp" : trend === "down" ? "trendDown" : "arrowRight";
  return (
    <div className={`card kpi ${className}`}>
      <div className="kpi__label">
        {icon && (
          <span className="kpi__ico">
            <Icon name={icon} size={16} />
          </span>
        )}
        {label}
      </div>
      <div className="kpi__val">
        {value}
        {unit && <small> {unit}</small>}
      </div>
      {(trendVal || note) && (
        <div className="kpi__foot">
          {trendVal && (
            <span className={"trend " + tcls}>
              <Icon name={ticon} size={13} />
              {trendVal}
            </span>
          )}
          {note && <span>{note}</span>}
        </div>
      )}
    </div>
  );
}

/* ---- Badge ---- */
/** Semantic kinds of visual status badges. */
type BadgeKind = "neutral" | "info" | "success" | "warning" | "danger" | "ghost";

/**
 * A capsule-shaped indicator tag displaying status levels.
 *
 * @param {Object} props - Component properties.
 * @param {BadgeKind} [props.kind="neutral"] - The semantic style preset.
 * @param {ReactNode} props.children - Inner tag content.
 * @param {boolean} [props.dot] - If true, renders a tiny circular dot leading the text.
 * @returns {JSX.Element} The rendered Badge.
 */
export function Badge({
  kind = "neutral",
  children,
  dot,
}: {
  kind?: BadgeKind;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span className={"badge badge--" + kind}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

/**
 * A specialized Badge variant resolving status tags into predefined semantic presets.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.cls - Raw status string key.
 * @param {string} props.label - User facing label for the state.
 * @returns {JSX.Element} The resolved StatusBadge.
 */
export function StatusBadge({ cls, label }: { cls: string; label: string }) {
  const map: Record<string, BadgeKind> = {
    info: "info",
    success: "success",
    warning: "warning",
    neutral: "neutral",
    danger: "danger",
  };
  return (
    <Badge kind={map[cls] ?? "neutral"} dot>
      {label}
    </Badge>
  );
}

/* ---- Entity pill (visual; drawer de conexões entra em fase posterior) ---- */
const ENTITY_META: Record<string, { cls: string; label: string }> = {
  pessoa: { cls: "e-pessoa", label: "Membro" },
  celula: { cls: "e-celula", label: "Célula" },
  coord: { cls: "e-coord", label: "Coordenação" },
  projeto: { cls: "e-projeto", label: "Projeto" },
  cliente: { cls: "e-cliente", label: "Cliente" },
  servico: { cls: "e-servico", label: "Serviço" },
  contrato: { cls: "e-contrato", label: "Contrato" },
};
/**
 * Renders a tiny capsule pill representing an entity (e.g. member, cell, project) with color codes.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.type - The entity classification string.
 * @param {string} props.label - Text designation shown.
 * @param {function} [props.onClick] - Optional interactive click handler.
 * @returns {JSX.Element} The rendered EntityPill.
 */
export function EntityPill({
  type,
  label,
  onClick,
}: {
  type: string;
  label: string;
  onClick?: () => void;
}) {
  const m = ENTITY_META[type] ?? ENTITY_META.pessoa;
  return (
    <span
      className={"epill " + m.cls + (onClick ? " cursor-pointer" : "")}
      title={m.label + ": " + label}
      onClick={onClick}
    >
      <span className="epill__dot" />
      {label}
    </span>
  );
}

/**
 * Renders a compact inline trend badge displaying a growth direction indicator arrow.
 *
 * @param {Object} props - Component properties.
 * @param {"up" | "down" | "flat"} props.dir - Direction of the trend.
 * @param {ReactNode} props.children - Inner tag content (usually numeric variance like +14%).
 * @returns {JSX.Element} The rendered Trend component.
 */
export function Trend({ dir, children }: { dir: "up" | "down" | "flat"; children: ReactNode }) {
  const tcls = dir === "up" ? "trend--up" : dir === "down" ? "trend--down" : "trend--flat";
  const ticon = dir === "up" ? "trendUp" : dir === "down" ? "trendDown" : "arrowRight";
  return (
    <span className={"trend " + tcls}>
      <Icon name={ticon} size={13} />
      {children}
    </span>
  );
}

/**
 * Renders a horizontal progress bar gauge.
 *
 * @param {Object} props - Component properties.
 * @param {number} props.value - Progress fraction (0 - 100).
 * @param {string} [props.color] - Optional background/fill color styling override.
 * @returns {JSX.Element} The rendered progress Bar.
 */
export function Bar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="bar">
      <div
        className="bar__fill"
        style={{ width: Math.min(100, value) + "%", background: color }}
      />
    </div>
  );
}

/**
 * Renders a horizontal stack of overlapping avatars.
 * Automatically handles initials generation and lists overflow counters.
 *
 * @param {Object} props - Component properties.
 * @param {string[]} [props.ids=[]] - Array of member string identifiers/names.
 * @param {number} [props.max=4] - Maximum number of initials to display before grouping under "+" indicator.
 * @param {number} [props.size=26] - Diameter width of each avatar in pixels.
 * @returns {JSX.Element} The rendered AvatarStack.
 */
export function AvatarStack({ ids = [], max = 4, size = 26 }: { ids?: string[]; max?: number; size?: number }) {
  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;
  const initials = (id: string) => {
    const digits = id.replace(/[^0-9]/g, "").slice(-2);
    if (digits) return digits;
    return id
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };
  return (
    <span className="avstack">
      {shown.map((id, i) => (
        <span
          key={i}
          className="av"
          style={{ width: size, height: size, background: "var(--meta-blue)", zIndex: 10 - i }}
        >
          {initials(id)}
        </span>
      ))}
      {extra > 0 && (
        <span className="av av--more" style={{ width: size, height: size }}>
          +{extra}
        </span>
      )}
    </span>
  );
}

/* ---- Section title ---- */
/**
 * Renders a styled section divider heading with trailing horizontal divider lines and optional action controls.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.icon] - Optional Lucide icon name.
 * @param {ReactNode} props.children - Heading text contents.
 * @param {ReactNode} [props.action] - Optional action buttons/controls placed to the right.
 * @returns {JSX.Element} The rendered SectionTitle.
 */
export function SectionTitle({
  icon,
  children,
  action,
}: {
  icon?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="sec-title">
      {icon && (
        <span className="sec-title__ico">
          <Icon name={icon} size={16} />
        </span>
      )}
      <h2>{children}</h2>
      <span className="line" />
      {action}
    </div>
  );
}

/* ---- Card ---- */
/**
 * Renders a themed dashboard block card container.
 * Supports customizable titles, subtitles, headers actions, content padding, and style overrides.
 *
 * @param {Object} props - Component properties.
 * @param {ReactNode} [props.title] - Card header title.
 * @param {ReactNode} [props.sub] - Card header secondary subtitle text.
 * @param {ReactNode} [props.action] - Optional buttons/links placed on top right header.
 * @param {ReactNode} [props.children] - Main card content.
 * @param {boolean} [props.pad=true] - If true, adds standard internal padding class.
 * @param {string} [props.className=""] - Extra CSS classes.
 * @param {CSSProperties} [props.style={}] - Optional React CSS styles properties.
 * @returns {JSX.Element} The rendered Card container.
 */
export function Card({
  title,
  sub,
  action,
  children,
  pad = true,
  className = "",
  style = {},
}: {
  title?: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  pad?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={"card " + (pad ? "card--pad " : "") + className} style={style}>
      {(title || action) && (
        <div className="card__head">
          <div>
            {title && <div className="card__title">{title}</div>}
            {sub && <div className="card__sub">{sub}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ---- Flow chain: o motivo da visão horizontal ---- */
/**
 * Renders a sequence of entity capsules connected by directional layout arrows.
 * Used to display relationship chains (e.g. Client -> Project -> Revenue).
 *
 * @param {Object} props - Component properties.
 * @param {Object[]} props.steps - Sequential steps.
 * @param {string} props.steps[].type - Capsule entity type tag.
 * @param {string} props.steps[].label - Capsule designation text.
 * @returns {JSX.Element} The rendered FlowChain diagram.
 */
export function FlowChain({ steps }: { steps: { type: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((s, i) => (
        <Fragment key={i}>
          <EntityPill type={s.type} label={s.label} />
          {i < steps.length - 1 && (
            <span className="flowarrow">
              <Icon name="arrowRight" size={15} />
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

/* ---- Placeholder note ---- */
/**
 * An informative callout banner styled with a leading info icon.
 *
 * @param {Object} props - Component properties.
 * @param {ReactNode} props.children - The inner content text or elements.
 * @returns {JSX.Element} The callout banner element.
 */
export function PlaceholderNote({ children }: { children: ReactNode }) {
  return (
    <div className="placeholder-note">
      <Icon name="info" size={18} />
      {children}
    </div>
  );
}
