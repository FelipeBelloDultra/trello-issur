import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Password } from "@/modules/account/domain/value-objects/password";

interface AccountProps {
  name: string;
  email: string;
  password: Password;
  createdAt: Date;
  updatedAt: Date;
}

export class Account extends Entity<AccountProps> {
  public get name(): string {
    return this.props.name;
  }

  public get email(): string {
    return this.props.email;
  }

  public get password(): Password {
    return this.props.password;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: AccountProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: AccountProps, id?: UniqueEntityID): Account {
    return new Account(props, id);
  }
}
