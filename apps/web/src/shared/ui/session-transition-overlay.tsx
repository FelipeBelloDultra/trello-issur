import { useAuthStore } from "@/entities/session";

import { Skeleton } from "./skeleton";

// Full-screen blocking overlay for hard session transitions (login/logout)
// — distinct from RouteProgressBar's lightweight top bar, which doesn't
// communicate "the whole auth context is changing" and would let stale
// authenticated/unauthenticated content flash underneath while the new
// route's guards resolve. Driven by AuthState.isTransitioning, which is
// only ever written by withSessionTransition.
export function SessionTransitionOverlay() {
  const isTransitioning = useAuthStore((state) => state.isTransitioning);

  if (!isTransitioning) return null;

  return (
    <div className="bg-background/80 fixed inset-0 z-200 flex items-center justify-center backdrop-blur-sm">
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
}
