import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/shared/lib/auth-store";

import { authenticate } from "../api/authenticate";

import type { AuthenticateInput } from "../api/authenticate";

export function useAuthenticate() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AuthenticateInput) => authenticate(input),
    onSuccess: async (response) => {
      setAccessToken(response.access_token);
      await queryClient.invalidateQueries({ queryKey: ["account", "me"] });
    },
  });
}
