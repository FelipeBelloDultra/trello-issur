import { apiRequest } from "@/shared/api";

export function logout(): Promise<void> {
  return apiRequest<void>("/auth/logout", { method: "POST" });
}
