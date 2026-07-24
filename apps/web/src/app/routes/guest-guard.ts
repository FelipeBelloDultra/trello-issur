import { redirect } from "@tanstack/react-router";

import { useAuthStore } from "@/entities/session";

// Used by /login and /signup: an already-authenticated visitor has no reason
// to see those pages — bounce them back into the app instead. Reads the Auth
// Store only (rootRoute's beforeLoad already resolved it), never fires its
// own /me or /refresh call.
export function redirectIfAuthenticated(): void {
  if (useAuthStore.getState().status !== "authenticated") return;

  // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's documented throw-a-redirect pattern
  throw redirect({ to: "/" });
}
