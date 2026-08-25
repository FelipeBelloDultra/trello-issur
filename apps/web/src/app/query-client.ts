import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api";

// Global toast for mutation failures that aren't field-scoped. A field-scoped
// error (422 Zod validation — ApiError.errors populated, see
// shared/api/client.ts) is left for the form to show inline via
// useFormErrors instead of double-surfacing it as a toast; anything else
// (business conflicts, invalid credentials, rate limiting, ...) toasts as
// before. Deliberately scoped to mutations, not queries — query failures
// include expected control-flow (e.g. the auth guard's 401 on every
// anonymous visit), which would spam toasts on ordinary navigation if
// surfaced this way.
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error instanceof ApiError && error.errors?.length) return;
      const message = error instanceof ApiError ? error.message : "Something went wrong";
      toast.error(message);
    },
  }),
});
