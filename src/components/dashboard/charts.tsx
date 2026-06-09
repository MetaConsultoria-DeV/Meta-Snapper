import type { ReactNode } from "react";
import { BRL } from "@/lib/mock-data";

export type ChartDatum = { label?: string; name?: string; value: number; color?: string };

/* ---- Funil comercial 3D (SVG) ----
   Camadas trapezoidais empilhadas com rim elíptico (profundidade), gradiente
   ciano→azul por camada, sombra e linhas conectando cada fase aos dados à direita.
   Fiel ao componente `Funnel` do MVP, reforçado com 3D/sombra/conectores. */
export type FunnelStage = { fase: string; qtd: number; valor: number };

// Cores institucionais da Meta Consultoria com acabamento brilhoso/3D
const FUNNEL_COLORS = [
  // Stage 0 (top): Rich Sky Blue / Cyan (softened, not neon/white)
  {
    bodyStop0: "#006fa3",      // Azul ciano escuro para as bordas
    bodyHighlight: "#8ad8ff",  // Brilho sky blue no meio
    bodyStop1: "#22c0ff",      // Ciano base
    topStop0: "#cbdfff",       // Superfície superior (fundo)
    topStop1: "#8ad8ff",       // Superfície superior (frente)
    stroke: "#50cbff",
  },
  // Stage 1: Medium Blue
  {
    bodyStop0: "#00599c",
    bodyHighlight: "#6bb9ff",
    bodyStop1: "#0088ff",
    topStop0: "#b3d1ff",
    topStop1: "#6bb9ff",
    stroke: "#339dff",
  },
  // Stage 2: Royal Blue
  {
    bodyStop0: "#00458a",
    bodyHighlight: "#3385ff",
    bodyStop1: "#0067ff",
    topStop0: "#99beff",
    topStop1: "#3385ff",
    stroke: "#1a75ff",
  },
  // Stage 3: Dark Royal Blue
  {
    bodyStop0: "#003373",
    bodyHighlight: "#1a66ff",
    bodyStop1: "#0052cc",
    topStop0: "#80abff",
    topStop1: "#1a66ff",
    stroke: "#0047b3",
  },
  // Stage 4: Deep Blue
  {
    bodyStop0: "#002257",
    bodyHighlight: "#0d4ad4",
    bodyStop1: "#0a33a3",
    topStop0: "#668eff",
    topStop1: "#0d4ad4",
    stroke: "#082c8f",
  },
  // Stage 5 (bottom): Dark Indigo / Navy
  {
    bodyStop0: "#051430",
    bodyHighlight: "#072b80",
    bodyStop1: "#052066",
    topStop0: "#4d71cc",
    topStop1: "#072b80",
    stroke: "#041647",
  },
];

// Geometria estática padrão para 6 estágios (afunilamento constante com gaps)
const STAGE_GEOMETRY = [
  { topHW: 118, botHW: 96 },
  { topHW: 90, botHW: 74 },
  { topHW: 68, botHW: 54 },
  { topHW: 48, botHW: 36 },
  { topHW: 32, botHW: 22 },
  { topHW: 18, botHW: 0 },
];

function getStageGeometry(i: number, total: number) {
  if (total === 6) {
    return STAGE_GEOMETRY[i];
  }
  // Interpolação genérica caso varie o número de estágios
  const maxHW = 118;
  const minHW = 12;
  const tTop = i / total;
  const tBot = (i + 1) / total;
  const topHW = minHW + (maxHW - minHW) * Math.pow(1 - tTop, 1.2);
  const botHW = i === total - 1 ? 0 : minHW + (maxHW - minHW) * Math.pow(1 - tBot, 1.2);
  return { topHW, botHW };
}

export function Funnel3D({
  stages,
  onPhase,
}: {
  stages: FunnelStage[];
  onPhase?: (fase: string) => void;
}) {
  const data = stages.slice(0, 6);
  if (!data.length) {
    return (
      <div className="grid h-[260px] place-items-center text-[13px] text-meta-navy-30">
        Sem oportunidades em pipeline ativo neste período.
      </div>
    );
  }

  const W = 540;
  const cx = 150;
  const stageH = 34; // Altura de cada bloco sólido
  const gap = 14;    // Espaço vertical entre blocos
  const padTop = 24;
  const N = data.length;
  
  const ryFor = (hw: number) => Math.max(5, hw * 0.16);
  const H = padTop + N * stageH + (N - 1) * gap + 25;

  const labelX = 308;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", display: "block", overflow: "visible" }}
      role="img"
      aria-label="Funil comercial"
    >
      <defs>
        {data.map((_, i) => {
          const color = FUNNEL_COLORS[i] || FUNNEL_COLORS[FUNNEL_COLORS.length - 1];
          return (
            <g key={i}>
              {/* Gradiente horizontal brilhante para a lateral cilíndrica */}
              <linearGradient id={`fnl-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color.bodyStop0} />
                <stop offset="25%" stopColor={color.bodyHighlight} />
                <stop offset="60%" stopColor={color.bodyStop1} />
                <stop offset="100%" stopColor={color.bodyStop0} />
              </linearGradient>
              {/* Gradiente vertical para a face superior elíptica */}
              <linearGradient id={`top-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.topStop0} />
                <stop offset="100%" stopColor={color.topStop1} />
              </linearGradient>
            </g>
          );
        })}
      </defs>

      {/* corpo do funil com sombra de profundidade suavizada */}
      <g style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,.18))" }}>
        {data
          .slice()
          .reverse()
          .map((s, revI) => {
            const i = data.length - 1 - revI;
            const color = FUNNEL_COLORS[i] || FUNNEL_COLORS[FUNNEL_COLORS.length - 1];
            const geom = getStageGeometry(i, N);
            const yTop = padTop + i * (stageH + gap);
            const yBot = yTop + stageH;
            const ryTop = ryFor(geom.topHW);
            const ryBot = ryFor(geom.botHW);
            
            // Corpo lateral do segmento (o último estágio é um cone pontiagudo)
            const body = i === N - 1
              ? `M ${cx - geom.topHW} ${yTop} L ${cx} ${yBot} L ${cx + geom.topHW} ${yTop} Z`
              : `M ${cx - geom.topHW} ${yTop} L ${cx - geom.botHW} ${yBot} A ${geom.botHW} ${ryBot} 0 0 0 ${cx + geom.botHW} ${yBot} L ${cx + geom.topHW} ${yTop} Z`;

            return (
              <g
                key={i}
                style={{ cursor: onPhase ? "pointer" : "default" }}
                onClick={() => onPhase?.(s.fase)}
              >
                {/* Lateral do frustum */}
                <path 
                  d={body} 
                  fill={`url(#fnl-${i})`} 
                  stroke={color.stroke} 
                  strokeWidth={0.5} 
                  strokeLinejoin="round"
                />
                
                {/* Face superior elíptica para dar o volume 3D */}
                <ellipse 
                  cx={cx} 
                  cy={yTop} 
                  rx={geom.topHW} 
                  ry={ryTop} 
                  fill={`url(#top-${i})`} 
                  stroke={color.stroke} 
                  strokeWidth={0.5} 
                />

                {/* Quantidade dentro da camada */}
                <text
                  x={cx}
                  y={yTop + stageH / 2 + 5}
                  textAnchor="middle"
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    fill: "#fff",
                    fontFamily: "var(--font-heading)",
                    textShadow: "0 1px 3px rgba(0,0,0,.45)",
                    pointerEvents: "none",
                  }}
                >
                  {s.qtd}
                </text>
              </g>
            );
          })}
      </g>

      {/* conectores + dados à direita */}
      {data.map((s, i) => {
        const geom = getStageGeometry(i, N);
        const midHW = (geom.topHW + geom.botHW) / 2;
        const midY = padTop + i * (stageH + gap) + stageH / 2;
        const conv = data[i + 1] ? Math.round((data[i + 1].qtd / (s.qtd || 1)) * 100) : null;
        return (
          <g key={i}>
            <path
              d={`M ${cx + midHW} ${midY} L ${labelX - 14} ${midY}`}
              stroke="rgba(42,216,255,.45)"
              strokeWidth={1.25}
              fill="none"
            />
            <circle cx={labelX - 14} cy={midY} r={2.6} fill="#2AD8FF" />
            <text
              x={labelX}
              y={midY - 3}
              style={{ fontSize: 12.5, fontWeight: 700, fill: "#fff", fontFamily: "var(--font-heading)" }}
            >
              {s.fase.length > 22 ? s.fase.slice(0, 21) + "…" : s.fase}
            </text>
            <text x={labelX} y={midY + 12} style={{ fontSize: 11, fill: "#b5bacc" }}>
              {s.valor > 0 ? `${BRL(s.valor)}` : `${s.qtd} oportunidades`}
              {conv !== null && (
                <tspan fill={conv < 50 ? "#f5a623" : "#2AD8FF"} fontWeight={700}>
                  {"  ↓ "}
                  {conv}%
                </tspan>
              )}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---- Mini bar chart (vertical) ---- */
export function BarChart({
  data,
  height = 130,
  fmt,
}: {
  data: ChartDatum[];
  height?: number;
  fmt?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="flex items-end justify-between gap-2.5 w-full pt-4" style={{ height }}>
      {data.map((d, i) => {
        const barHeightPct = (d.value / max) * 100;
        const bg = d.color === "var(--meta-blue)" 
          ? "linear-gradient(180deg, var(--meta-blue-light) 0%, var(--meta-blue) 100%)"
          : d.color ?? "var(--meta-gradient-v)";
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            {/* Valor no topo */}
            <span className="text-[12px] font-bold text-meta-navy opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200" style={{ fontFamily: "var(--font-heading)" }}>
              {fmt ? fmt(d.value) : d.value}
            </span>
            
            {/* Track & Bar (Cápsula de fundo cinza com o preenchimento) */}
            <div className="w-full max-w-[20px] bg-meta-navy-10 rounded-full flex items-end relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_4px_12px_rgba(0,103,255,0.15)]" style={{ height: "calc(100% - 40px)" }}>
              <div 
                title={`${d.label ?? d.name}: ${d.value}`}
                className="w-full rounded-full transition-all duration-500 ease-out origin-bottom scale-y-95 group-hover:scale-y-100"
                style={{ 
                  height: `${barHeightPct}%`, 
                  background: bg,
                  boxShadow: d.color === "var(--meta-blue)" ? "0 0 8px rgba(0,103,255,0.2)" : "none"
                }}
              />
            </div>
            
            {/* Label na base */}
            <span className="text-[10px] font-bold text-meta-navy-50 uppercase tracking-wider group-hover:text-meta-navy transition-colors duration-200">
              {d.label ?? d.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}


/* ---- Donut (SVG) ---- */
export function Donut({
  segments,
  size = 132,
  thickness = 18,
  center,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  thickness?: number;
  center?: ReactNode;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  // Pré-computa offsets acumulados (sem reatribuir variável durante o render).
  const arcs: { len: number; offset: number; color: string }[] = [];
  segments.reduce((acc, seg) => {
    const len = (seg.value / total) * c;
    arcs.push({ len, offset: acc, color: seg.color });
    return acc + len;
  }, 0);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--meta-navy-10)"
          strokeWidth={thickness}
        />
        {arcs.map((seg, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeLinecap="butt"
            strokeDasharray={`${seg.len} ${c - seg.len}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
      {center && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          {center}
        </div>
      )}
    </div>
  );
}
