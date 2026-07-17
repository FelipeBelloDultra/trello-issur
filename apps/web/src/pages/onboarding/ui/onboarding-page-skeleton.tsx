import { Skeleton } from "@/shared/ui/skeleton";

export function OnboardingPageSkeleton() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-[340px] flex-col items-center gap-8">
        <Skeleton className="size-9 rounded-lg" />
        <div className="flex w-full flex-col items-center gap-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="w-full space-y-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
