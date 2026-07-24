import { getMe } from "../api/get-me";

import { useAuthStore } from "./auth-store";

// Runs exactly once per SPA lifetime, memoized as a shared promise so every
// route guard that asks for it (root included) triggers the same GET
// /auth/me instead of firing one each. From here on the store is kept in
// sync by login/logout directly — nothing re-queries /me on its own.
let bootstrapPromise: Promise<void> | null = null;

export function bootstrapSession(): Promise<void> {
  bootstrapPromise ??= getMe()
    .then((user) => useAuthStore.getState().setAuthenticated(user))
    .catch(() => useAuthStore.getState().setUnauthenticated());

  return bootstrapPromise;
}
