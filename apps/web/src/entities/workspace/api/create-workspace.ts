import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api";

interface CreateWorkspaceInput {
  name: string;
}

interface CreateWorkspaceResponse {
  id: string;
  name: string;
}

function createWorkspace(input: CreateWorkspaceInput): Promise<CreateWorkspaceResponse> {
  return apiRequest<CreateWorkspaceResponse>("/workspaces", { method: "POST", body: input });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
