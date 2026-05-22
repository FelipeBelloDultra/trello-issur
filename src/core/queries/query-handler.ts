import { Query } from "./query";

export interface QueryHandler<Q extends Query, R> {
  execute(query: Q): Promise<R>;
}
