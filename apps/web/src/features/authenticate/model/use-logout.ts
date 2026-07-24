import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/entities/session";

import { logout } from "../api/logout";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      useAuthStore.getState().setUnauthenticated();
    },
  });
}
