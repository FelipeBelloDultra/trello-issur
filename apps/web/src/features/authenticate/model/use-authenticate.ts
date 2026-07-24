import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getMe, useAuthStore } from "@/entities/session";

import { authenticate } from "../api/authenticate";

import type { AuthenticateInput } from "../api/authenticate";

export function useAuthenticate() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: (input: AuthenticateInput) => authenticate(input),
    onSuccess: async () => {
      const user = await getMe();
      setAuthenticated(user);
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
