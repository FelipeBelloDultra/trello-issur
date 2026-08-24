import { useAuthStore } from "./auth-store";

// Escape hatch only — if the wrapped operation is still pending past this,
// stop blocking the UI behind the overlay rather than risk it never
// clearing. The operation itself keeps running; this just gives up on
// hiding it.
const TRANSITION_TIMEOUT_MS = 10000;

// Single writer for AuthState.isTransitioning: every hard session
// transition (login/logout — the mutation plus the navigation it triggers)
// must go through here instead of toggling the flag directly at the call
// site. The finally block is what guarantees the flag clears on every
// path — success, thrown error, or the timeout below — so no call site can
// leave it stuck true.
export async function withSessionTransition<T>(operation: () => Promise<T>): Promise<T> {
  const { setTransitioning } = useAuthStore.getState();

  setTransitioning(true);
  const escapeHatch = setTimeout(() => setTransitioning(false), TRANSITION_TIMEOUT_MS);

  try {
    return await operation();
  } finally {
    clearTimeout(escapeHatch);
    setTransitioning(false);
  }
}
