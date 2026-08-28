import { z } from "zod";

import { CARD_TITLE_MAX } from "@/modules/board/domain/value-objects/card-title";

export const UpdateCardDto = z
  .object({
    title: z.string().min(1).max(CARD_TITLE_MAX).optional(),
    description: z.string().max(2000).nullish(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined, {
    message: "at least one of title or description must be provided",
  });

export type UpdateCardDtoType = z.infer<typeof UpdateCardDto>;
