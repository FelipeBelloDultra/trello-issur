import { Skeleton } from "@/shared/ui/skeleton";

// Shown by rootRoute's pendingComponent while bootstrapSession() resolves
// (the one GET /auth/me every SPA load waits on before any guard runs).
export function AppBootSkeleton() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
}
