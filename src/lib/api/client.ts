/**
 * Cliente HTTP centralizado para o backend FastAPI (PAPE API).
 * Nenhuma página deve chamar `fetch` diretamente — sempre passar por aqui.
 *
 * Só roda no servidor (Server Components) — o `server-only` garante em build-time
 * que este módulo nunca entre no bundle do cliente, mantendo a URL do backend fora dele.
 *
 * Base URL via env: `API_URL` (server-only). Por compatibilidade ainda lê
 * `NEXT_PUBLIC_API_URL` como fallback — prefira migrar o deploy para `API_URL`.
 *
 * `BDU_READ_TOKEN` (server-only, opcional): se definido, é enviado como
 * `Authorization: Bearer` em toda chamada. Pareia com o gate fail-open do
 * backend (router /api/bdu) — enquanto a env não existir nos dois lados, nada muda.
 */
import "server-only";

/** The resolved base URL for the FastAPI backend service. */
const BASE_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Optional token used for authenticating reading requests against backend gateway APIs. */
const READ_TOKEN = process.env.BDU_READ_TOKEN;

/**
 * Custom error class representing failed API requests.
 * Holds the HTTP status code and details of the request.
 */
export class ApiError extends Error {
  /**
   * Creates an instance of ApiError.
   *
   * @param {number} status - The HTTP response status code (e.g. 404, 500).
   * @param {string} message - Human-readable error description.
   */
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Options for configuring the outgoing fetch request. */
type RequestOptions = {
  /** Query parameters serialized and appended to the request URL. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Next.js specific caching and revalidation policies. */
  next?: { revalidate?: number; tags?: string[] };
  /** Standard fetch API caching mode (e.g. 'no-store', 'force-cache'). */
  cache?: RequestCache;
  /** Abort signal to cancel the request. */
  signal?: AbortSignal;
};

/**
 * Builds a complete URL by appending the path and query parameters to the BASE_URL.
 *
 * @param {string} path - The relative endpoint path (e.g. '/api/bdu/overview').
 * @param {RequestOptions["params"]} [params] - Optional query parameters.
 * @returns {string} The fully qualified request URL.
 */
function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(path.replace(/^\//, ""), BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/");
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Centralized GET request helper. Sets up Authorization headers, revalidation tags, and returns typed response.
 * Throws ApiError if response status is not successful.
 *
 * @template T - Expected JSON response shape.
 * @param {string} path - Relative endpoint path.
 * @param {RequestOptions} [options={}] - Configuration options for fetch and query parameters.
 * @returns {Promise<T>} Resolves to the parsed JSON response body.
 * @throws {ApiError} If the HTTP response is not ok.
 */
export async function apiGet<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(buildUrl(path, options.params), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(READ_TOKEN ? { Authorization: `Bearer ${READ_TOKEN}` } : {}),
    },
    cache: options.cache,
    next: options.next,
    signal: options.signal,
  });
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} falhou (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** Centralized HTTP client interface containing get method and resolved base API URL. */
export const api = { get: apiGet, baseUrl: BASE_URL };
