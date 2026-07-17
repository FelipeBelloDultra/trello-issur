import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api";

import type { Workspace } from "../model/types";

function getWorkspaces(): Promise<Workspace[]> {
  return apiRequest<Workspace[]>("/workspaces");
}

export function workspacesQueryOptions() {
  return queryOptions({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  });
}

export function useWorkspacesQuery() {
  return useQuery(workspacesQueryOptions());
}
