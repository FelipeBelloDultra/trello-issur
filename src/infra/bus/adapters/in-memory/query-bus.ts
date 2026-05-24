import { injectable } from "tsyringe";

import { Query } from "@/core/queries/query";
import { QueryBus } from "@/core/queries/query-bus";
import { QueryHandler } from "@/core/queries/query-handler";

@injectable()
export class InMemoryQueryBus implements QueryBus {
  private readonly handlers = new Map<string, QueryHandler<Query, unknown>>();

  public register<Q extends Query, R>(
    queryClass: { name: string },
    handler: QueryHandler<Q, R>,
  ): void {
    this.handlers.set(queryClass.name, handler);
  }

  public async ask<R>(query: Query): Promise<R> {
    const name = query.constructor.name;
    const handler = this.handlers.get(name);

    if (!handler) {
      throw new Error(`No query handler registered for: ${name}`);
    }

    return handler.execute(query) as Promise<R>;
  }
}
