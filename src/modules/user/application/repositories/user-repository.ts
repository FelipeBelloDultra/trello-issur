import { User } from "@/modules/user/domain/entities/user";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<void>;
}
