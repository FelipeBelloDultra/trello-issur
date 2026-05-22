import { User } from "@/modules/user/domain/entities/user";

export class UserPresenter {
  public static toHTTP(user: User) {
    return {
      id: user.id.toValue(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
