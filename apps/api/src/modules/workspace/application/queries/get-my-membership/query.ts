import { Query } from "@/core/queries/query";

export class GetMyMembershipQuery implements Query {
  public constructor(
    public readonly accountId: string,
    public readonly workspaceId: string,
  ) {}
}
