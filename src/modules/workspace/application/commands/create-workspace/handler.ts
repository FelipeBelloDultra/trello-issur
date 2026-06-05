import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";
import { WorkspaceMemberRoles } from "@/modules/workspace/domain/value-objects/workspace-member-role";
import { WorkspaceName } from "@/modules/workspace/domain/value-objects/workspace-name";
import { WorkspaceSlug } from "@/modules/workspace/domain/value-objects/workspace-slug";

import { WorkspaceSlugAlreadyTakenError } from "../../errors/workspace-slug-already-taken.error";
import { WorkspaceMemberRepository } from "../../repositories/workspace-member.repository";
import { WorkspaceRepository } from "../../repositories/workspace.repository";

import { CreateWorkspaceCommand } from "./command";

type OnError = WorkspaceSlugAlreadyTakenError;
type OnSuccess = { workspace: Workspace };
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class CreateWorkspaceHandler implements CommandHandler<
  CreateWorkspaceCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Workspace)
    private readonly workspaceRepository: WorkspaceRepository,
    @inject(InjectionTokens.Repositories.WorkspaceMember)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
  ) {}

  public async execute(command: CreateWorkspaceCommand): Output {
    const name = WorkspaceName.create(command.props.name);
    const baseSlug = WorkspaceSlug.fromName(command.props.name);

    if (!command.props.isPersonal) {
      const taken = await this.workspaceRepository.findBySlug(baseSlug.toString());
      if (taken) return left(new WorkspaceSlugAlreadyTakenError(baseSlug.toString()));
    }

    const slug = command.props.isPersonal ? await this.resolveUniqueSlug(baseSlug) : baseSlug;

    const workspace = Workspace.create({
      name,
      slug,
      ownerId: UniqueEntityID.create(command.props.ownerId),
      description: command.props.description ?? null,
      avatarUrl: null,
      isPersonal: command.props.isPersonal,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.workspaceRepository.create(workspace);
    await this.workspaceMemberRepository.create({
      workspaceId: workspace.id.toValue(),
      accountId: command.props.ownerId,
      role: WorkspaceMemberRoles.Owner,
    });

    return right({ workspace });
  }

  private async resolveUniqueSlug(base: WorkspaceSlug): Promise<WorkspaceSlug> {
    let candidate = base;

    while (await this.workspaceRepository.findBySlug(candidate.toString())) {
      candidate = base.withRandomSuffix();
    }

    return candidate;
  }
}
