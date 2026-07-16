import path from "node:path";

import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";
import { StorageGateway } from "@/shared/storage/application/gateways/storage.gateway";

import { WorkspaceNotFoundError } from "../../errors/workspace-not-found.error";
import { WorkspaceRepository } from "../../repositories/workspace.repository";

import { UpdateWorkspaceAvatarCommand } from "./command";

type OnError = WorkspaceNotFoundError;
type OnSuccess = { workspace: Workspace };
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class UpdateWorkspaceAvatarHandler implements CommandHandler<
  UpdateWorkspaceAvatarCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Workspace)
    private readonly workspaceRepository: WorkspaceRepository,
    @inject(InjectionTokens.Storage.Gateway)
    private readonly storage: StorageGateway,
  ) {}

  public async execute(command: UpdateWorkspaceAvatarCommand): Output {
    const workspace = await this.workspaceRepository.findById(command.props.workspaceId);

    if (!workspace) return left(new WorkspaceNotFoundError());

    const ext = path.extname(command.props.originalName).toLowerCase();
    const key = `workspaces/${command.props.workspaceId}/avatar${ext}`;
    const previousKey = workspace.avatarUrl;

    await this.storage.upload({
      key,
      buffer: command.props.buffer,
      mimeType: command.props.mimeType,
    });

    workspace.updateAvatar(key);
    await this.workspaceRepository.save(workspace);

    if (previousKey && previousKey !== key) {
      await this.storage.delete(previousKey).catch(() => undefined);
    }

    return right({ workspace });
  }
}
