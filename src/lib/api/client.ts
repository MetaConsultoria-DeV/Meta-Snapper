/**
 * Cliente HTTP centralizado para o backend FastAPI (PAPE API).
 * Nenhuma página deve chamar `fetch` diretamente — sempre passar por aqui.
 *
 * Base URL via env: NEXT_PUBLIC_API_URL (default http://localhost:8000).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  /** Query params serializados para a URL. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Next.js fetch cache/revalidate. */
  next?: { revalidate?: number; tags?: string[] };
  /** Next.js native fetch cache mode (e.g. no-store, force-cache) */
  cache?: RequestCache;
  signal?: AbortSignal;
};

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(path.replace(/^\//, ""), BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/");
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiGet<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(buildUrl(path, options.params), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: options.cache,
    next: options.next,
    signal: options.signal,
  });
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} falhou (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = { get: apiGet, baseUrl: BASE_URL };
