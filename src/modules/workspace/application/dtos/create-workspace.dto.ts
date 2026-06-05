import { z } from "zod";

import {
  WORKSPACE_NAME_MAX,
  WORKSPACE_NAME_MIN,
} from "@/modules/workspace/domain/value-objects/workspace-name";

export const CreateWorkspaceDto = z.object({
  name: z.string().min(WORKSPACE_NAME_MIN).max(WORKSPACE_NAME_MAX),
  description: z
    .string()
    .max(500)
    .nullish()
    .transform((v) => v ?? null),
});

export type CreateWorkspaceDtoType = z.infer<typeof CreateWorkspaceDto>;
