import { PasswordHasherGateway } from "@/modules/account/application/gateways/password-hasher.gateway";

export class InMemoryPasswordHasherGateway implements PasswordHasherGateway {
  public hash(plain: string): Promise<string> {
    return Promise.resolve(`hashed:${plain}`);
  }

  public compare(plain: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${plain}`);
  }
}
