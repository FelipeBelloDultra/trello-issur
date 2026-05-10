import { UserRepository } from "@/modules/user/application/repositories/user-repository";
import { User } from "@/modules/user/domain/entities/user";

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  public async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((u) => u.email === email);
    return Promise.resolve(user ?? null);
  }

  public async create(user: User): Promise<void> {
    await Promise.resolve(this.items.push(user));
  }
}
