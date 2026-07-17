import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authenticate } from "../api/authenticate";

import type { AuthenticateInput } from "../api/authenticate";

export function useAuthenticate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AuthenticateInput) => authenticate(input),
    // LoginForm/SignupPage already surface this error inline — skip the
    // global toast to avoid showing the same failure twice.
    meta: { suppressErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["account", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
