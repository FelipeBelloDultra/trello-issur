import { Query } from "./query";

export interface QueryBus {
  ask<R>(query: Query): Promise<R>;
}
