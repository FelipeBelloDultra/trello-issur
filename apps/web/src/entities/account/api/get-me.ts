import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api";

import type { Account } from "../model/types";

function getMe(): Promise<Account> {
  return apiRequest<Account>("/auth/me");
}

export function accountMeQueryOptions() {
  return queryOptions({
    queryKey: ["account", "me"],
    queryFn: getMe,
    retry: false,
  });
}

export function useAccountQuery() {
  return useQuery(accountMeQueryOptions());
}
