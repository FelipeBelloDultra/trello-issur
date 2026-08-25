import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateWorkspace } from "@/entities/workspace";
import { useFormErrors } from "@/shared/lib/hooks";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

// Mirrors apps/api's WorkspaceName value object
// (src/modules/workspace/domain/value-objects/workspace-name.ts) — that's
// the single source of truth, kept in sync by hand since there's no shared
// codegen between the two apps.
const WORKSPACE_NAME_MIN = 3;
const WORKSPACE_NAME_MAX = 80;

const onboardingSchema = z.object({
  name: z.string().min(WORKSPACE_NAME_MIN).max(WORKSPACE_NAME_MAX),
});

type OnboardingSchema = z.infer<typeof onboardingSchema>;

export function OnboardingPage() {
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const form = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: "" },
  });
  const { handleApiError } = useFormErrors(form);

  const onSubmit = form.handleSubmit(async (values) => {
    // Field-scoped errors (422) land on the "name" input via useFormErrors;
    // anything else surfaces via the global mutation-error toast (see
    // app/query-client.ts).
    try {
      const workspace = await createWorkspace.mutateAsync({ name: values.name });
      void navigate({ to: "/w/$workspaceId", params: { workspaceId: workspace.id } });
    } catch (err) {
      handleApiError(err);
    }
  });

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-8">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-semibold">
          TI
        </div>

        <div className="flex w-full flex-col gap-1 text-center">
          <h1 className="text-xl font-medium">Create your first workspace</h1>
          <p className="text-muted-foreground text-sm">
            You don&apos;t belong to any workspace yet.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={(e) => void onSubmit(e)} className="w-full space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createWorkspace.isPending}>
              {createWorkspace.isPending ? "Creating..." : "Create workspace"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
