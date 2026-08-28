import { z } from "zod";

import { CARD_TITLE_MAX } from "@/modules/board/domain/value-objects/card-title";

export const CreateCardDto = z.object({
  title: z.string().min(1).max(CARD_TITLE_MAX),
  description: z
    .string()
    .max(2000)
    .nullish()
    .transform((v) => v ?? null),
});

export type CreateCardDtoType = z.infer<typeof CreateCardDto>;
