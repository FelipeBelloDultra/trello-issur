import { apiRequest } from "@/shared/api";

import type { Account } from "../model/types";

export function getMe(): Promise<Account> {
  return apiRequest<Account>("/auth/me");
}
