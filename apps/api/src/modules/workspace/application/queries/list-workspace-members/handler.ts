import { inject, injectable } from "tsyringe";

import { PaginationResult } from "@/core/entity/pagination";
import { QueryHandler } from "@/core/queries/query-handler";
import { InjectionTokens } from "@/infra/container/tokens";

import {
  WorkspaceMemberRepository,
  WorkspaceMemberView,
} from "../../repositories/workspace-member.repository";

import { ListWorkspaceMembersQuery } from "./query";

type Output = Promise<{ members: WorkspaceMemberView[]; pagination: PaginationResult }>;

@injectable()
export class ListWorkspaceMembersHandler implements QueryHandler<
  ListWorkspaceMembersQuery,
  Awaited<Output>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.WorkspaceMember)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
  ) {}

  public async execute(query: ListWorkspaceMembersQuery): Output {
    const { workspaceId, pagination } = query;

    const { members, total } = await this.workspaceMemberRepository.findManyByWorkspace(
      workspaceId,
      pagination,
    );

    return { members, pagination: pagination.calculate(total) };
  }
}
