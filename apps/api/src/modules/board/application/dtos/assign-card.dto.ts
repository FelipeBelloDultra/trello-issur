import { z } from "zod";

export const AssignCardDto = z.object({
  assigneeAccountId: z.uuid().nullable(),
});

export type AssignCardDtoType = z.infer<typeof AssignCardDto>;
