import { z } from "zod";

import {
  ACCOUNT_NAME_MAX,
  ACCOUNT_NAME_WORDS_PATTERN,
} from "@/modules/account/domain/value-objects/account-name";

export const CreateAccountDto = z.object({
  name: z
    .string()
    .max(ACCOUNT_NAME_MAX)
    .regex(
      ACCOUNT_NAME_WORDS_PATTERN,
      "must contain at least two words with at least 2 characters each",
    ),
  email: z.email(),
  password: z.string().min(8),
  create_workspace: z.boolean().default(false),
});

export type CreateAccountInput = z.infer<typeof CreateAccountDto>;
