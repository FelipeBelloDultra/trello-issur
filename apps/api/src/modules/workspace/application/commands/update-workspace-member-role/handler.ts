import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";

import { CannotUpdateOwnerRoleError } from "../../errors/cannot-update-owner-role.error";
import { WorkspaceMemberNotFoundError } from "../../errors/workspace-member-not-found.error";
import { WorkspaceMemberRepository } from "../../repositories/workspace-member.repository";

import { UpdateWorkspaceMemberRoleCommand } from "./command";

type OnError = WorkspaceMemberNotFoundError | CannotUpdateOwnerRoleError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class UpdateWorkspaceMemberRoleHandler implements CommandHandler<
  UpdateWorkspaceMemberRoleCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.WorkspaceMember)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
  ) {}

  public async execute(command: UpdateWorkspaceMemberRoleCommand): Output {
    const member = await this.workspaceMemberRepository.findById(command.memberId);

    if (!member?.workspaceId.equals(UniqueEntityID.create(command.workspaceId))) {
      return left(new WorkspaceMemberNotFoundError());
    }

    if (member.isOwner()) {
      return left(new CannotUpdateOwnerRoleError());
    }

    await this.workspaceMemberRepository.updateRole({ id: command.memberId, role: command.role });

    return right(undefined);
  }
}
