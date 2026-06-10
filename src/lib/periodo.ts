/**
 * Período global do topo (recorte temporal das leituras).
 *
 * A Meta opera em semestres (empresa júnior): 26.1 vai até 30/06 e 26.2 começa
 * em 01/07. O estado vive num cookie (`bdu_periodo`) para persistir entre
 * páginas e ser lido pelos Server Components, que repassam o intervalo aos
 * endpoints com data (caixa/transações). A página Comercial mantém o seletor
 * próprio (?periodo=) e ignora este recorte.
 */

export type PeriodoKey = "30d" | "sem1" | "sem2" | "ano" | "tudo" | "custom";
export type Periodo = { key: PeriodoKey; de?: string; ate?: string };
export type PeriodoRange = { data_inicio?: string; data_fim?: string };

export const PERIODO_COOKIE = "bdu_periodo";
export const PERIODO_PADRAO: Periodo = { key: "tudo" };

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function serializePeriodo(p: Periodo): string {
  if (p.key === "custom") return `custom:${p.de ?? ""}:${p.ate ?? ""}`;
  return p.key;
}

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

/** Semestre corrente: 26.1 até 30/06, 26.2 de 01/07 em diante. */
export function semestreAtual(hoje = new Date()): "sem1" | "sem2" {
  return hoje.getMonth() + 1 <= 6 ? "sem1" : "sem2";
}

/** Rótulos calculados do ano corrente: { sem1: "26.1", sem2: "26.2", ano: "2026" }. */
export function periodoLabels(hoje = new Date()) {
  const ano = hoje.getFullYear();
  const yy = String(ano % 100).padStart(2, "0");
  return { sem1: `${yy}.1`, sem2: `${yy}.2`, ano: String(ano) };
}

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
  }
}
