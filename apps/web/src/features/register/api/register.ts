import { apiRequest } from "@/shared/api";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  create_workspace: boolean;
}

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export function register(input: RegisterInput): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/accounts", {
    method: "POST",
    body: input,
  });
}
