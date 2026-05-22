import { AccountRepository } from "@/modules/account/application/repositories/account-repository";
import { Account } from "@/modules/account/domain/entities/account";

export class InMemoryAccountRepository implements AccountRepository {
  public items: Account[] = [];

  public async findByEmail(email: string): Promise<Account | null> {
    const account = this.items.find((a) => a.email === email);
    return Promise.resolve(account ?? null);
  }

  public async create(account: Account): Promise<void> {
    await Promise.resolve(this.items.push(account));
  }
}
