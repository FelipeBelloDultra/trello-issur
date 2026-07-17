import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api";

import type { WorkspaceMember } from "../model/types";

function getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  return apiRequest<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
}

export function workspaceMembersQueryOptions(workspaceId: string) {
  return queryOptions({
    queryKey: ["workspaces", workspaceId, "members"],
    queryFn: () => getMembers(workspaceId),
  });
}

export function useWorkspaceMembersQuery(workspaceId: string) {
  return useQuery(workspaceMembersQueryOptions(workspaceId));
}
