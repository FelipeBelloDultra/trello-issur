import { Account } from "@/modules/account/domain/entities/account";

export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  create(account: Account): Promise<void>;
}
