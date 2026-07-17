import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api";

import type { Membership } from "../model/types";

function getMembership(workspaceId: string): Promise<Membership> {
  return apiRequest<Membership>(`/workspaces/${workspaceId}/me`);
}

export function workspaceMembershipQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: ["workspaces", workspaceId, "me"],
    queryFn: () => getMembership(workspaceId),
  });
}

export function useWorkspaceMembershipQuery(workspaceId: string) {
  return useQuery(workspaceMembershipQueryOptions(workspaceId));
}
