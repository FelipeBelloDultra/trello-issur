import { z } from "zod";

export const MoveCardDto = z.object({
  columnId: z.uuid(),
  index: z.number().int().min(0),
});

export type MoveCardDtoType = z.infer<typeof MoveCardDto>;
