import { z } from "zod";

import { COLUMN_NAME_MAX } from "@/modules/board/domain/value-objects/column-name";

export const CreateColumnDto = z.object({
  name: z.string().min(1).max(COLUMN_NAME_MAX),
});

export type CreateColumnDtoType = z.infer<typeof CreateColumnDto>;
