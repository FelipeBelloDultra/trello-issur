import { Query } from "@/core/queries/query";

export class ListMyWorkspacesQuery implements Query {
  public constructor(public readonly accountId: string) {}
}
