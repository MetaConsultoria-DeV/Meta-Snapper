import { cookies } from "next/headers";
import { PERIODO_COOKIE, parsePeriodo, rangePeriodo, type Periodo, type PeriodoRange } from "./periodo";

/** Lê o período ativo do cookie (Server Components). */
export async function periodoAtivo(): Promise<{ periodo: Periodo; range: PeriodoRange }> {
  const store = await cookies();
  const raw = store.get(PERIODO_COOKIE)?.value;
  const decoded = raw ? decodeURIComponent(raw) : undefined;
  const periodo = parsePeriodo(decoded);
  return { periodo, range: rangePeriodo(periodo) };
}
