import { z } from "zod";

import { BOARD_NAME_MAX } from "@/modules/board/domain/value-objects/board-name";

export const RenameBoardDto = z.object({
  name: z.string().min(1).max(BOARD_NAME_MAX),
});

export type RenameBoardDtoType = z.infer<typeof RenameBoardDto>;
