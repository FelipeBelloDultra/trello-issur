import { Query } from "@/core/queries/query";

export class ListWorkspaceBoardsQuery implements Query {
  public constructor(public readonly workspaceId: string) {}
}
