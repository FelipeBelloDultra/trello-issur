import { z } from "zod";

import { COLUMN_NAME_MAX } from "@/modules/board/domain/value-objects/column-name";

export const MoveColumnDto = z
  .object({
    name: z.string().min(1).max(COLUMN_NAME_MAX).optional(),
    index: z.number().int().min(0).optional(),
  })
  .refine((data) => data.name !== undefined || data.index !== undefined, {
    message: "at least one of name or index must be provided",
  });

export type MoveColumnDtoType = z.infer<typeof MoveColumnDto>;
