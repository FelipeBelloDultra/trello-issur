import { Skeleton } from "@/shared/ui/skeleton";

// Shown by workspaceLayoutRoute's pendingComponent while membership is being
// verified — mirrors WorkspaceLayout's shape without mounting the real
// AppSidebar (which would fire its own queries before we even know the
// caller is a member of this workspace).
export function WorkspaceLayoutSkeleton() {
  return (
    <div className="flex min-h-svh">
      <div className="border-border hidden w-64 flex-col gap-4 border-r p-3 md:flex">
        <Skeleton className="h-8 w-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center border-b px-4">
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
