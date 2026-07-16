import { injectable } from "tsyringe";

import { Query } from "@/core/queries/query";
import { QueryBus } from "@/core/queries/query-bus";
import { QueryHandler } from "@/core/queries/query-handler";

@injectable()
export class InMemoryQueryBus implements QueryBus {
  private readonly handlers = new Map<object, QueryHandler<Query, unknown>>();

  public register<Q extends Query, R>(
    queryClass: new (...args: never[]) => Q,
    handler: QueryHandler<Q, R>,
  ): void {
    if (this.handlers.has(queryClass)) {
      throw new Error(`Query handler already registered for: ${queryClass.name}`);
    }

    this.handlers.set(queryClass, handler);
  }

  public async ask<R>(query: Query): Promise<R> {
    const handler = this.handlers.get(query.constructor);

    if (!handler) {
      throw new Error(`No query handler registered for: ${query.constructor.name}`);
    }

    return handler.execute(query) as Promise<R>;
  }
}
