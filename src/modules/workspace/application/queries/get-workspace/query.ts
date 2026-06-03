import { Query } from "@/core/queries/query";

export class GetWorkspaceQuery implements Query {
  public constructor(public readonly workspaceId: string) {}
}
