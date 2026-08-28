import { z } from "zod";

export const MoveCardDto = z.object({
  columnId: z.uuid(),
  position: z.number().finite(),
});

export type MoveCardDtoType = z.infer<typeof MoveCardDto>;
