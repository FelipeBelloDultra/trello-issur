import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";

import { CannotRemoveWorkspaceOwnerError } from "../../errors/cannot-remove-workspace-owner.error";
import { WorkspaceMemberNotFoundError } from "../../errors/workspace-member-not-found.error";
import { WorkspaceMemberRepository } from "../../repositories/workspace-member.repository";

import { RemoveWorkspaceMemberCommand } from "./command";

type OnError = WorkspaceMemberNotFoundError | CannotRemoveWorkspaceOwnerError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class RemoveWorkspaceMemberHandler implements CommandHandler<
  RemoveWorkspaceMemberCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.WorkspaceMember)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
  ) {}

  public async execute(command: RemoveWorkspaceMemberCommand): Output {
    const member = await this.workspaceMemberRepository.findById(command.memberId);

    if (!member) {
      return left(new WorkspaceMemberNotFoundError());
    }

    if (member.isOwner()) {
      return left(new CannotRemoveWorkspaceOwnerError());
    }

    await this.workspaceMemberRepository.remove(command.memberId);

    return right(undefined);
  }
}
