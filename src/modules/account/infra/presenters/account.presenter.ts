import { Account } from "@/modules/account/domain/entities/account";

export class AccountPresenter {
  public static toHTTP(account: Account) {
    return {
      id: account.id.toValue(),
      name: account.name,
      email: account.email,
      createdAt: account.createdAt,
    };
  }
}
