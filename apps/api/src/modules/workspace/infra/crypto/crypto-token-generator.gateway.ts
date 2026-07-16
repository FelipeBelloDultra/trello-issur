import { randomBytes } from "node:crypto";

import { injectable } from "tsyringe";

import { TokenGeneratorGateway } from "@/modules/workspace/application/gateways/token-generator.gateway";

@injectable()
export class CryptoTokenGeneratorGateway implements TokenGeneratorGateway {
  public generate(): string {
    return randomBytes(32).toString("hex");
  }
}
