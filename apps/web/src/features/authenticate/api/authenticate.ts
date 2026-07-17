import { apiRequest } from "@/shared/api";

export interface AuthenticateInput {
  email: string;
  password: string;
}

interface AuthenticateResponse {
  authenticated: true;
}

export function authenticate(input: AuthenticateInput): Promise<AuthenticateResponse> {
  return apiRequest<AuthenticateResponse>("/auth/authenticate", {
    method: "POST",
    body: input,
  });
}
