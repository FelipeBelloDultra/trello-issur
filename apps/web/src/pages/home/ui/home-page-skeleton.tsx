import { Skeleton } from "@/shared/ui/skeleton";

export function HomePageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-1 p-6">
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-4 w-40" />

      <div className="border-border mt-6 flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-24">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
