import { redirect } from "@tanstack/react-router";

import { accountMeQueryOptions } from "@/entities/account";

import type { QueryClient } from "@tanstack/react-query";

// Used by /login and /signup: an already-authenticated visitor has no reason
// to see those pages — bounce them back into the app instead.
export async function redirectIfAuthenticated(queryClient: QueryClient): Promise<void> {
  try {
    await queryClient.ensureQueryData(accountMeQueryOptions());
  } catch {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's documented throw-a-redirect pattern
  throw redirect({ to: "/" });
}
