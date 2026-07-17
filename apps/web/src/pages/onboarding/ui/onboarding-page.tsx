import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useCreateWorkspace } from "@/entities/workspace";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export function OnboardingPage() {
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const workspace = await createWorkspace.mutateAsync({ name });
    void navigate({ to: "/w/$workspaceId", params: { workspaceId: workspace.id } });
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-[340px] flex-col items-center gap-8">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-semibold">
          TI
        </div>

        <div className="flex w-full flex-col gap-1 text-center">
          <h1 className="text-xl font-medium">Create your first workspace</h1>
          <p className="text-muted-foreground text-sm">
            You don&apos;t belong to any workspace yet.
          </p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc"
              autoFocus
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={createWorkspace.isPending}>
            {createWorkspace.isPending ? "Creating..." : "Create workspace"}
          </Button>
        </form>
      </div>
    </div>
  );
}
