import { cookies } from "next/headers";
import { PERIODO_COOKIE, parsePeriodo, rangePeriodo, type Periodo, type PeriodoRange } from "./periodo";

/**
 * Resolves the currently active period and range from the client's cookie store.
 * Safe to call directly within Next.js Server Components.
 *
 * @returns {Promise<{ periodo: Periodo; range: PeriodoRange }>} Active period configuration and parsed ISO start/end range boundaries.
 */
export async function periodoAtivo(): Promise<{ periodo: Periodo; range: PeriodoRange }> {
  const store = await cookies();
  const raw = store.get(PERIODO_COOKIE)?.value;
  const decoded = raw ? decodeURIComponent(raw) : undefined;
  const periodo = parsePeriodo(decoded);
  return { periodo, range: rangePeriodo(periodo) };
}
