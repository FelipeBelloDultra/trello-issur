import { ApiError } from "@/shared/api";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

// Maps a caught mutation error onto react-hook-form's field-level state
// when the backend attached field-scoped detail (422 Zod validation — see
// apps/api's ErrorHandlerMiddleware and shared/api/client.ts's ApiError).
// Anything else (business conflicts, invalid credentials, rate limiting,
// ...) isn't field-scoped and is left alone — the global mutation-error
// toast (app/query-client.ts) already covers that case, and skips toasting
// when it sees field-scoped errors so the two don't double up.
export function useFormErrors<TFieldValues extends FieldValues>(form: UseFormReturn<TFieldValues>) {
  function handleApiError(error: unknown): void {
    if (!(error instanceof ApiError) || !error.errors?.length) return;

    for (const { field, message } of error.errors) {
      form.setError(field as Path<TFieldValues>, { type: "server", message });
    }
  }

  return { handleApiError };
}
