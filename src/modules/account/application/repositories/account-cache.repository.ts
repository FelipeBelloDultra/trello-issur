import { Account } from "@/modules/account/domain/entities/account";

export interface AccountCacheRepository {
  findById(id: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  store(account: Account): Promise<void>;
  invalidate(id: string, email: string): Promise<void>;
}
