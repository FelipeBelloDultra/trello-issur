import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { workspacesQueryOptions } from "@/entities/workspace";
import { useAuthenticate } from "@/features/authenticate";
import { RegisterForm } from "@/features/register";

import type { QueryClient } from "@tanstack/react-query";

const WORKSPACE_POLL_ATTEMPTS = 6;
const WORKSPACE_POLL_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// "Create a workspace for me" fires an async, queue-backed job on the
// backend (WorkspacePersonalCreationRequestedConsumer) — it isn't guaranteed
// to exist the instant sign-in completes. Poll briefly for it rather than
// navigating straight into a false "you have no workspaces" empty state.
async function waitForFirstWorkspace(queryClient: QueryClient): Promise<string | undefined> {
  for (let attempt = 0; attempt < WORKSPACE_POLL_ATTEMPTS; attempt += 1) {
    const workspaces = await queryClient.fetchQuery(workspacesQueryOptions());
    if (workspaces[0]) return workspaces[0].id;
    await sleep(WORKSPACE_POLL_DELAY_MS);
  }
  return undefined;
}

export function SignupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authenticate = useAuthenticate();

  const handleSuccess = async ({
    email,
    password,
    create_workspace: createWorkspace,
  }: {
    email: string;
    password: string;
    create_workspace: boolean;
  }) => {
    try {
      await authenticate.mutateAsync({ email, password });
    } catch {
      // Account was created but the auto sign-in failed (e.g. rate limited) —
      // send them to sign in manually instead of leaving them stuck here.
      void navigate({ to: "/login" });
      return;
    }

    if (createWorkspace) {
      const workspaceId = await waitForFirstWorkspace(queryClient);
      if (workspaceId) {
        void navigate({ to: "/w/$workspaceId", params: { workspaceId } });
        return;
      }
    }

    void navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-8">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-semibold">
          TI
        </div>

        <div className="flex w-full flex-col gap-1 text-center">
          <h1 className="text-xl font-medium">Create your account</h1>
          <p className="text-muted-foreground text-sm">Get started with Trello Issur.</p>
        </div>

        <RegisterForm onSuccess={(values) => void handleSuccess(values)} />

        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
