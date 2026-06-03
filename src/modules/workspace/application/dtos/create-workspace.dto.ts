import { z } from "zod";

export const CreateWorkspaceDto = z.object({
  name: z.string().min(3).max(80),
  description: z.string().max(500).nullish().transform((v) => v ?? null),
});

export type CreateWorkspaceDtoType = z.infer<typeof CreateWorkspaceDto>;
