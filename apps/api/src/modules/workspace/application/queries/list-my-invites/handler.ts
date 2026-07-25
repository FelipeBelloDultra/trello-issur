import { inject, injectable } from "tsyringe";

import { PaginationResult } from "@/core/entity/pagination";
import { QueryHandler } from "@/core/queries/query-handler";
import { InjectionTokens } from "@/infra/container/tokens";

import {
  MyWorkspaceInviteView,
  WorkspaceInviteRepository,
} from "../../repositories/workspace-invite.repository";

import { ListMyInvitesQuery } from "./query";

type Result = { invites: MyWorkspaceInviteView[]; pagination: PaginationResult };

@injectable()
export class ListMyInvitesHandler implements QueryHandler<ListMyInvitesQuery, Result> {
  public constructor(
    @inject(InjectionTokens.Repositories.WorkspaceInvite)
    private readonly inviteRepository: WorkspaceInviteRepository,
  ) {}

  public async execute(query: ListMyInvitesQuery): Promise<Result> {
    const { invites, total } = await this.inviteRepository.findPendingByEmail(
      query.accountEmail,
      query.pagination,
    );

    return { invites, pagination: query.pagination.calculate(total) };
  }
}
