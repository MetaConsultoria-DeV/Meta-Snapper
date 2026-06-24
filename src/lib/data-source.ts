/**
 * Seam de dados — ponto único entre as páginas e a origem dos dados.
 *
 * HOJE (Phase 2/3): re-exporta os mocks (`mock-data.ts`, `org-data.ts`).
 * PHASE 5: a implementação interna passa a usar o cliente de API
 * (`lib/api/client.ts`) contra os endpoints FastAPI criados na Phase 4.
 *
 * Como as páginas consomem dados derivados de `DB`/`ORG`, a migração para
 * API real troca a fonte aqui (e converte páginas para Server Components
 * async que recebem os dados já consolidados) sem reescrever o JSX/visual.
 *
 * Tipos do contrato real da API ficam em `@/types`.
 */
/** Re-exported mock database utilities for visual prototypes. */
export { DB, BRL } from "./mock-data";

/** Re-exported static SETTA organizational structure and associated meta configurations. */
export { ORG, tipoMeta } from "./org-data";

/**
 * Signals the active data source for pages.
 * - 'mock': Uses mock-data.ts datasets.
 * - 'api': Retrieves data from live FastAPI server endpoints.
 */
export const DATA_SOURCE: "mock" | "api" = "mock";
