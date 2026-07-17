import { Skeleton } from "@/shared/ui/skeleton";

export function MembersPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <Skeleton className="h-6 w-24" />

      <div className="border-border overflow-hidden rounded-lg border">
        <div className="bg-muted/50 flex gap-4 px-4 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-border flex gap-4 border-t px-4 py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
