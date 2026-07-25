import { Pagination } from "@/core/entity/pagination";
import { Query } from "@/core/queries/query";

export class ListMyInvitesQuery implements Query {
  public constructor(
    public readonly accountEmail: string,
    public readonly pagination: Pagination,
  ) {}
}
