import { useMutation } from "@tanstack/react-query";

import { register } from "../api/register";

import type { RegisterInput } from "../api/register";

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    // RegisterForm already surfaces this error inline — skip the global
    // toast to avoid showing the same failure twice.
    meta: { suppressErrorToast: true },
  });
}
