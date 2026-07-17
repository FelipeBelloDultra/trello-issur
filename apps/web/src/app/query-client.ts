import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api";

// Global toast for mutation failures that don't already show their own
// inline error UI (forms handling their own errors opt out via
// `meta: { suppressErrorToast: true }`, see use-authenticate.ts/use-register.ts).
// Deliberately scoped to mutations, not queries — query failures include
// expected control-flow (e.g. the auth guard's 401 on every anonymous visit),
// which would spam toasts on ordinary navigation if surfaced this way.
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressErrorToast) return;
      const message = error instanceof ApiError ? error.message : "Something went wrong";
      toast.error(message);
    },
  }),
});
