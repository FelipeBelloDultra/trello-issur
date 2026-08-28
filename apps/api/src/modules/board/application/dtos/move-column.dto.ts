import { z } from "zod";

import { COLUMN_NAME_MAX } from "@/modules/board/domain/value-objects/column-name";

export const MoveColumnDto = z
  .object({
    name: z.string().min(1).max(COLUMN_NAME_MAX).optional(),
    position: z.number().finite().optional(),
  })
  .refine((data) => data.name !== undefined || data.position !== undefined, {
    message: "at least one of name or position must be provided",
  });

export type MoveColumnDtoType = z.infer<typeof MoveColumnDto>;
