import { Account } from "@/modules/account/domain/entities/account";

export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  // Always hits the database directly (never cached) and is the only method
  // allowed to return an Account with a real passwordHash.
  findCredentialsByEmail(email: string): Promise<Account | null>;
  create(account: Account): Promise<void>;
}
