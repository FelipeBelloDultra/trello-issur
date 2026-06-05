import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { AccountName } from "../value-objects/account-name";
import { Email } from "../value-objects/email";

interface AccountProps {
  name: AccountName;
  email: Email;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Account extends Entity<AccountProps> {
  public get name(): string {
    return this.props.name.toString();
  }

  public get email(): string {
    return this.props.email.toString();
  }

  public get passwordHash(): string {
    return this.props.passwordHash;
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
