import { z } from "zod";

import { DTO } from "@/core/entity/dto";
import {
  ACCOUNT_NAME_MAX,
  ACCOUNT_NAME_WORDS_PATTERN,
} from "@/modules/account/domain/value-objects/account-name";

const schema = z.object({
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

export type CreateAccountInput = z.infer<typeof schema>;

export class CreateAccountDto extends DTO<CreateAccountInput> {
  public get name() {
    return this.props.name;
  }

  public get email() {
    return this.props.email;
  }

  public get password() {
    return this.props.password;
  }

  public get createWorkspace() {
    return this.props.create_workspace;
  }

  public static create(props: unknown) {
    return new CreateAccountDto(schema.parse(props));
  }
}
