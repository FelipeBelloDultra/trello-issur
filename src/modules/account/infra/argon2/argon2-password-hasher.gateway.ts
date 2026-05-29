import argon2 from "argon2";
import { injectable } from "tsyringe";

import { PasswordHasherGateway } from "@/modules/account/application/gateways/password-hasher.gateway";

@injectable()
export class Argon2PasswordHasherGateway implements PasswordHasherGateway {
  public async hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  public async compare(plain: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
