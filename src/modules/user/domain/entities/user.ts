import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { Password } from "@/modules/user/domain/value-objects/password";

interface UserProps {
  name: string;
  email: string;
  password: Password;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
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

  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: UserProps, id?: UniqueEntityID): User {
    return new User(props, id);
  }
}
