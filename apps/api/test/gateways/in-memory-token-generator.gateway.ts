import { TokenGeneratorGateway } from "@/modules/workspace/application/gateways/token-generator.gateway";

export class InMemoryTokenGeneratorGateway implements TokenGeneratorGateway {
  public readonly generated: string[] = [];

  private counter = 0;

  public generate(): string {
    const token = `token-${++this.counter}`;
    this.generated.push(token);
    return token;
  }
}
