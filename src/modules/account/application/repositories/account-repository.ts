import { Account } from "@/modules/account/domain/entities/account";

export interface AccountRepository {
  findByEmail(email: string): Promise<Account | null>;
  create(account: Account): Promise<void>;
}
