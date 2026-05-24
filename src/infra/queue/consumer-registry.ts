import { injectable } from "tsyringe";

import { QueueConsumer } from "./adapters/rabbitmq/consumer";

@injectable()
export class ConsumerRegistry {
  private readonly _consumers: QueueConsumer<unknown>[] = [];

  public register(consumer: QueueConsumer<unknown>): void {
    this._consumers.push(consumer);
  }

  public getAll(): readonly QueueConsumer<unknown>[] {
    return [...this._consumers];
  }
}
