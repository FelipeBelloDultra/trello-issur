import { Pagination } from "@/core/entity/pagination";
import { Query } from "@/core/queries/query";

export class ListNotificationsQuery implements Query {
  public constructor(
    public readonly accountId: string,
    public readonly pagination: Pagination,
    public readonly read?: boolean,
  ) {}
}
