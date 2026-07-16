import { env } from "@/shared/config";
import { useAuthStore } from "@/shared/lib/auth-store";

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

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;
  const { accessToken } = useAuthStore.getState();

  const response = await fetch(`${env.apiUrl}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

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
