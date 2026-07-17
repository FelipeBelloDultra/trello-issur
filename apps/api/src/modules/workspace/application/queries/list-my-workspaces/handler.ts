import { inject, injectable } from "tsyringe";

import { QueryHandler } from "@/core/queries/query-handler";
import { InjectionTokens } from "@/infra/container/tokens";
import { AccountRoleRepository } from "@/modules/auth/application/repositories/account-role.repository";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";

import { WorkspaceRepository } from "../../repositories/workspace.repository";

import { ListMyWorkspacesQuery } from "./query";

export interface MyWorkspaceView {
  workspace: Workspace;
  role: string;
}

@injectable()
export class ListMyWorkspacesHandler implements QueryHandler<
  ListMyWorkspacesQuery,
  MyWorkspaceView[]
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Workspace)
    private readonly workspaceRepository: WorkspaceRepository,
    @inject(InjectionTokens.Repositories.AccountRole)
    private readonly accountRoleRepository: AccountRoleRepository,
  ) {}

  public async execute(query: ListMyWorkspacesQuery): Promise<MyWorkspaceView[]> {
    const workspaces = await this.workspaceRepository.findAllByAccountId(query.accountId);

    return Promise.all(
      workspaces.map(async (workspace) => ({
        workspace,
        role:
          (await this.accountRoleRepository.findRole(query.accountId, workspace.id.toValue())) ??
          "member",
      })),
    );
  }
}
