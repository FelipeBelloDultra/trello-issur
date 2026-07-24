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
}

const AUTH_PATHS_WITHOUT_RETRY = new Set(["/auth/refresh", "/auth/authenticate", "/auth/logout"]);

function rawFetch(path: string, options: RequestOptions): Promise<Response> {
  const { method = "GET", body } = options;

  return fetch(`${env.apiUrl}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshPromise ??= rawFetch("/auth/refresh", { method: "POST" })
    .then((response) => response.ok)
    .finally(() => {
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
