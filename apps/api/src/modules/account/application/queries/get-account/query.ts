import { Query } from "@/core/queries/query";

export class GetAccountQuery implements Query {
  public constructor(public readonly accountId: string) {}
}
