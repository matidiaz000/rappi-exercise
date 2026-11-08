import {
  ApiError,
  networkError,
  parseErrorPayload,
  timeoutError,
} from "./errors";

export type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface HttpClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
}

export interface HttpClientOptions {
  baseUrl: string;
  getToken: () => string | null;
  onUnauthorized?: () => void;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 12_000;

function buildUrl(
  baseUrl: string,
  path: string,
  query: Record<string, QueryValue> | undefined,
): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const params = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return `${normalizedBase}${normalizedPath}${queryString ? `?${queryString}` : ""}`;
}

export function createHttpClient({
  baseUrl,
  getToken,
  onUnauthorized,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: HttpClientOptions): HttpClient {
  async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      method = "GET",
      body,
      query,
      auth = true,
      signal,
      timeoutMs: requestTimeout = timeoutMs,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
    const abortFromCaller = () => controller.abort(signal?.reason);
    signal?.addEventListener("abort", abortFromCaller, { once: true });

    const headers = new Headers();
    headers.set("Accept", "application/json");

    if (body !== undefined) headers.set("Content-Type", "application/json");

    if (auth) {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    let response: Response;

    try {
      response = await fetchImpl(buildUrl(baseUrl, path, query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      if (controller.signal.aborted) throw timeoutError(error);
      throw networkError(error);
    } finally {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortFromCaller);
    }

    const rawText = await response.text();
    let payload: unknown = null;
    if (rawText) {
      try {
        payload = JSON.parse(rawText);
      } catch {
        payload = rawText;
      }
    }

    if (!response.ok) {
      if (response.status === 401 && auth) onUnauthorized?.();
      const { message, fieldErrors } = parseErrorPayload(payload, response.status);
      throw new ApiError(message, {
        kind: "http",
        status: response.status,
        fieldErrors,
        details: payload,
      });
    }

    return payload as T;
  }

  return { request };
}
