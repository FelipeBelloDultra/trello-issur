import { Query } from "./query";
import { QueryHandler } from "./query-handler";

export interface QueryBus {
  register<Q extends Query, R>(queryClass: { name: string }, handler: QueryHandler<Q, R>): void;
  ask<R>(query: Query): Promise<R>;
}
