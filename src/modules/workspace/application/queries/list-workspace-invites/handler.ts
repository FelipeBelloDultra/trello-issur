import { inject, injectable } from "tsyringe";

import { PaginationResult } from "@/core/entity/pagination";
import { QueryHandler } from "@/core/queries/query-handler";
import { InjectionTokens } from "@/infra/container/tokens";

import {
  WorkspaceInviteRepository,
  WorkspaceInviteView,
} from "../../repositories/workspace-invite.repository";

import { ListWorkspaceInvitesQuery } from "./query";

type Result = { invites: WorkspaceInviteView[]; pagination: PaginationResult };

@injectable()
export class ListWorkspaceInvitesHandler implements QueryHandler<
  ListWorkspaceInvitesQuery,
  Result
> {
  public constructor(
    @inject(InjectionTokens.Repositories.WorkspaceInvite)
    private readonly inviteRepository: WorkspaceInviteRepository,
  ) {}

  public async execute(query: ListWorkspaceInvitesQuery): Promise<Result> {
    const { invites, total } = await this.inviteRepository.findManyByWorkspace(
      query.workspaceId,
      query.pagination,
    );

    return { invites, pagination: query.pagination.calculate(total) };
  }
}
