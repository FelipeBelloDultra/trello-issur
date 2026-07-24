import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";

import { useAuthStore } from "@/entities/session";
import { useWorkspacesQuery } from "@/entities/workspace";
import { useLogout } from "@/features/authenticate";

interface Membership {
  role?: string;
  permissions?: string[];
}

export function useAppSidebar() {
  const navigate = useNavigate();
  const { workspaceId } = useParams({ strict: false });
  // UX-only: which nav items render as enabled. The actual enforcement is
  // AuthorizeMiddleware/ValidateWorkspaceMiddleware on the server — this never
  // substitutes for that, it only avoids showing dead links.
  const membership: Membership | undefined = useRouteContext({ strict: false });
  const account = useAuthStore((state) => state.user);
  const { data: workspaces } = useWorkspacesQuery();
  const logout = useLogout();

  const currentWorkspace = workspaces?.find((w) => w.id === workspaceId);

  const handleSignOut = async (): Promise<void> => {
    await logout.mutateAsync();
    void navigate({ to: "/login" });
  };

  const handleSwitchWorkspace = (targetWorkspaceId: string): void => {
    void navigate({ to: "/w/$workspaceId", params: { workspaceId: targetWorkspaceId } });
  };

  return {
    account,
    workspaces,
    currentWorkspace,
    workspaceId,
    membership,
    handleSignOut,
    handleSwitchWorkspace,
  };
}
