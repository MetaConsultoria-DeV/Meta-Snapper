/**
 * Período global do topo (recorte temporal das leituras).
 *
 * A Meta opera em semestres (empresa júnior): 26.1 vai até 30/06 e 26.2 começa
 * em 01/07. O estado vive num cookie (`bdu_periodo`) para persistir entre
 * páginas e ser lido pelos Server Components, que repassam o intervalo aos
 * endpoints com data (caixa/transações). A página Comercial mantém o seletor
 * próprio (?periodo=) e ignora este recorte.
 */

/** Supported period keys for temporal data analysis. */
export type PeriodoKey = "30d" | "sem1" | "sem2" | "ano" | "tudo" | "custom";

/** Represents a period selection configuration. */
export type Periodo = { key: PeriodoKey; de?: string; ate?: string };

/** Resulting date boundaries in ISO format (YYYY-MM-DD) for database filters. */
export type PeriodoRange = { data_inicio?: string; data_fim?: string };

/** Cookie name used to persist the selected global period. */
export const PERIODO_COOKIE = "bdu_periodo";

/** Default fallback period. */
export const PERIODO_PADRAO: Periodo = { key: "tudo" };

/** Formats a date object to ISO YYYY-MM-DD. */
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Serializes a Periodo object into a string suitable for cookie storage.
 * Custom ranges are serialized as `custom:from_date:to_date`.
 *
 * @param {Periodo} p - The period config.
 * @returns {string} The serialized string representation.
 */
export function serializePeriodo(p: Periodo): string {
  if (p.key === "custom") return `custom:${p.de ?? ""}:${p.ate ?? ""}`;
  return p.key;
}

/**
 * Parses a serialized period string back into a typed Periodo object.
 * Fallbacks to PERIODO_PADRAO if string is invalid or incomplete.
 *
 * @param {string | undefined | null} raw - The serialized period cookie value.
 * @returns {Periodo} The parsed Periodo object.
 */
export function parsePeriodo(raw: string | undefined | null): Periodo {
  if (!raw) return PERIODO_PADRAO;
  if (raw.startsWith("custom:")) {
    const [, de, ate] = raw.split(":");
    if (!de && !ate) return PERIODO_PADRAO;
    return { key: "custom", de: de || undefined, ate: ate || undefined };
  }
  if (["30d", "sem1", "sem2", "ano", "tudo"].includes(raw)) return { key: raw as PeriodoKey };
  return PERIODO_PADRAO;
}

/**
 * Returns the current active semester ('sem1' or 'sem2') based on the calendar month.
 *
 * @param {Date} [hoje=new Date()] - Date reference (defaults to current local date).
 * @returns {"sem1" | "sem2"} The active semester key.
 */
export function semestreAtual(hoje = new Date()): "sem1" | "sem2" {
  return hoje.getMonth() + 1 <= 6 ? "sem1" : "sem2";
}

/**
 * Generates display text labels for semesters and year reference.
 *
 * @param {Date} [hoje=new Date()] - Date reference.
 * @returns {{ sem1: string; sem2: string; ano: string }} Labels map (e.g. { sem1: "26.1", sem2: "26.2", ano: "2026" }).
 */
export function periodoLabels(hoje = new Date()) {
  const ano = hoje.getFullYear();
  const yy = String(ano % 100).padStart(2, "0");
  return { sem1: `${yy}.1`, sem2: `${yy}.2`, ano: String(ano) };
}

/**
 * Translates a Periodo selection configuration into ISO YYYY-MM-DD date boundaries.
 * Custom range uses stored boundary strings directly.
 *
 * @param {Periodo} p - The period config.
 * @param {Date} [hoje=new Date()] - Date reference.
 * @returns {PeriodoRange} The resolved date boundaries.
 */
export function rangePeriodo(p: Periodo, hoje = new Date()): PeriodoRange {
  const ano = hoje.getFullYear();
  switch (p.key) {
    case "tudo":
      return {};
    case "30d": {
      const ini = new Date(hoje);
      ini.setDate(ini.getDate() - 30);
      return { data_inicio: iso(ini), data_fim: iso(hoje) };
    }
    case "sem1":
      return { data_inicio: `${ano}-01-01`, data_fim: `${ano}-06-30` };
    case "sem2":
      return { data_inicio: `${ano}-07-01`, data_fim: `${ano}-12-31` };
    case "ano":
      return { data_inicio: `${ano}-01-01`, data_fim: `${ano}-12-31` };
    case "custom":
      return { data_inicio: p.de, data_fim: p.ate };
    default:
      return {}; // Fallback para período inválido
  }
}
