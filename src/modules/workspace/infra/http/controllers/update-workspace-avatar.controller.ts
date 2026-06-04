import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { FileUploadMiddleware } from "@/infra/http/middlewares/file-upload.middleware";
import { ValidateWorkspaceMiddleware } from "@/infra/http/middlewares/validate-workspace.middleware";
import { UpdateWorkspaceAvatarCommand } from "@/modules/workspace/application/commands/update-workspace-avatar/command";
import { WorkspaceNotFoundError } from "@/modules/workspace/application/errors/workspace-not-found.error";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";

import { WorkspacePresenter } from "../../presenters/workspace.presenter";

@injectable()
export class UpdateWorkspaceAvatarController implements Controller {
  public readonly path = "/workspaces/:workspaceId/avatar";
  public readonly method: HttpMethod = "patch";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Command) private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Middlewares.Auth) private readonly auth: AuthMiddleware,
    @inject(InjectionTokens.Middlewares.ValidateWorkspace)
    private readonly validateWorkspace: ValidateWorkspaceMiddleware,
    @inject(InjectionTokens.Middlewares.FileUpload)
    private readonly fileUpload: FileUploadMiddleware,
  ) {
    this.middlewares = [
      auth.handle(),
      validateWorkspace.handle(),
      fileUpload.handle({
        fieldName: "avatar",
        maxSizeBytes: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      }),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { workspaceId } = req.params;
    const file = req.uploadedFile;

    if (!workspaceId || Array.isArray(workspaceId)) {
      throw new HttpException({ statusCode: 404, message: "Workspace not found." });
    }

    if (!file) {
      throw new HttpException({ statusCode: 400, message: "No file uploaded." });
    }

    const result = await this.commandBus.dispatch<
      Either<WorkspaceNotFoundError, { workspace: Workspace }>
    >(
      new UpdateWorkspaceAvatarCommand({
        workspaceId,
        buffer: file.buffer,
        mimeType: file.mimeType,
        originalName: file.originalName,
      }),
    );

    if (result.isLeft()) {
      throw new HttpException({ statusCode: 404, message: result.value.message });
    }

    return res.status(200).json({ data: WorkspacePresenter.toHTTP(result.value.workspace) });
  }
}
