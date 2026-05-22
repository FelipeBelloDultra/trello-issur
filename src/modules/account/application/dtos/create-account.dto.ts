import { z } from "zod";

import { DTO } from "@/core/entity/dto";

const schema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
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

  public static create(props: unknown) {
    return new CreateAccountDto(schema.parse(props));
  }
}
