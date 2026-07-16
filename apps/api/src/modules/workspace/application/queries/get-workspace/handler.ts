import { inject, injectable } from "tsyringe";

import { QueryHandler } from "@/core/queries/query-handler";
import { InjectionTokens } from "@/infra/container/tokens";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";

import { WorkspaceRepository } from "../../repositories/workspace.repository";

import { GetWorkspaceQuery } from "./query";

@injectable()
export class GetWorkspaceHandler implements QueryHandler<GetWorkspaceQuery, Workspace | null> {
  public constructor(
    @inject(InjectionTokens.Repositories.Workspace)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async execute(query: GetWorkspaceQuery): Promise<Workspace | null> {
    return this.workspaceRepository.findById(query.workspaceId);
  }
}
