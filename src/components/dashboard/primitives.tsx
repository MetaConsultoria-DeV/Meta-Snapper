import { Fragment, type ReactNode, type CSSProperties } from "react";
import { Icon } from "./icon";

/* ---- KPI tile ---- */
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
type BadgeKind = "neutral" | "info" | "success" | "warning" | "danger" | "ghost";
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

/* ---- Trend inline ---- */
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

/* ---- Bar ---- */
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

/* ---- Avatar stack ---- */
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
export function PlaceholderNote({ children }: { children: ReactNode }) {
  return (
    <div className="placeholder-note">
      <Icon name="info" size={18} />
      {children}
    </div>
  );
}
