import { env } from "@/shared/config";

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: ApiFieldError[];

  public constructor(message: string, statusCode: number, errors?: ApiFieldError[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

interface ApiSuccessEnvelope<T> {
  data: T;
}

interface ApiErrorEnvelope {
  message: string;
  errors?: ApiFieldError[];
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

const AUTH_PATHS_WITHOUT_RETRY = new Set(["/auth/refresh", "/auth/authenticate", "/auth/logout"]);

function rawFetch(path: string, options: RequestOptions): Promise<Response> {
  const { method = "GET", body, headers } = options;

  return fetch(`${env.apiUrl}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Not a secret — just a correlation id so a retried /auth/refresh can be
// recognized as "the same attempt" by the backend's idempotency middleware.
// Doesn't need crypto-grade randomness, so no Web Crypto API dependency.
function generateIdempotencyKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function attemptRefresh(idempotencyKey: string): Promise<boolean> {
  return rawFetch("/auth/refresh", {
    method: "POST",
    headers: { "x-idempotency-key": idempotencyKey },
  }).then((response) => response.ok);
}

let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshPromise ??= (async () => {
    const idempotencyKey = generateIdempotencyKey();

    try {
      return await attemptRefresh(idempotencyKey);
    } catch {
      // The request may have already rotated the session server-side even
      // though this response never arrived (dropped connection). Retrying
      // with the SAME key lets the backend's idempotency middleware replay
      // that result instead of rejecting a second attempt against an
      // already-rotated (now stale) refresh token.
      return attemptRefresh(idempotencyKey);
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await rawFetch(path, options);

  if (response.status === 401 && !AUTH_PATHS_WITHOUT_RETRY.has(path)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      response = await rawFetch(path, options);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const errorJson = (await response.json()) as ApiErrorEnvelope;
    throw new ApiError(errorJson.message, response.status, errorJson.errors);
  }

  const json = (await response.json()) as ApiSuccessEnvelope<T>;
  return json.data;
}
