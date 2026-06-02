import { injectable } from "tsyringe";

import { Consumer } from "./contracts/consumer";

@injectable()
export class ConsumerRegistry {
  private readonly _consumers: Consumer[] = [];

  public register(consumer: Consumer): void {
    this._consumers.push(consumer);
  }

  public getAll(): readonly Consumer[] {
    return [...this._consumers];
  }
}
