import { Kanban } from "lucide-react";

import { useAccountQuery } from "@/entities/account";

export function HomePage() {
  const { data: account, isLoading } = useAccountQuery();

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-1 p-6">
      <h1 className="text-lg font-semibold">Welcome back, {account?.name}</h1>
      <p className="text-muted-foreground text-sm">{account?.email}</p>

      <div className="border-border mt-6 flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-24">
        <Kanban className="text-muted-foreground size-6" />
        <p className="text-sm font-medium">No boards yet</p>
        <p className="text-muted-foreground max-w-xs text-center text-sm">
          Boards, workspaces, and everything else in the sidebar is left for you to build.
        </p>
      </div>
    </div>
  );
}
