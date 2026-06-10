import { cookies } from "next/headers";
import { PERIODO_COOKIE, parsePeriodo, rangePeriodo, type Periodo, type PeriodoRange } from "./periodo";

/** Lê o período ativo do cookie (Server Components). */
export async function periodoAtivo(): Promise<{ periodo: Periodo; range: PeriodoRange }> {
  const store = await cookies();
  const periodo = parsePeriodo(store.get(PERIODO_COOKIE)?.value);
  return { periodo, range: rangePeriodo(periodo) };
}
