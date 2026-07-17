import { useMutation } from "@tanstack/react-query";

import { register } from "../api/register";

import type { RegisterInput } from "../api/register";

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
  });
}
