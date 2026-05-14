import { User } from "@/modules/user/domain/entities/user";

type RegisterUserResponse = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export class UserPresenter {
  public static registerUserToHttp(user: User): RegisterUserResponse {
    return {
      id: user.id.toValue(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
