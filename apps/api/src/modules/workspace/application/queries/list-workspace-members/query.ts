import { Pagination } from "@/core/entity/pagination";
import { Query } from "@/core/queries/query";

export class ListWorkspaceMembersQuery implements Query {
  public constructor(
    public readonly workspaceId: string,
    public readonly pagination: Pagination,
  ) {}
}
