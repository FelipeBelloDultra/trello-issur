import { z } from "zod";

// Mirrors apps/api's WorkspaceName value object
// (src/modules/workspace/domain/value-objects/workspace-name.ts) — that's
// the single source of truth, kept in sync by hand since there's no shared
// codegen between the two apps.
const WORKSPACE_NAME_MIN = 3;
const WORKSPACE_NAME_MAX = 80;

export const workspaceNameSchema = z.object({
  name: z.string().min(WORKSPACE_NAME_MIN).max(WORKSPACE_NAME_MAX),
});

export type WorkspaceNameSchema = z.infer<typeof workspaceNameSchema>;
