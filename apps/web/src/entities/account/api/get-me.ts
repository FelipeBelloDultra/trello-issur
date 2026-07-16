import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/auth-store";

import type { Account } from "../model/types";

function getMe(): Promise<Account> {
  return apiRequest<Account>("/auth/me");
}

export function useAccountQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["account", "me"],
    queryFn: getMe,
    enabled: accessToken !== null,
    retry: false,
  });
}
