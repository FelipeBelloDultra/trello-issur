import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { AuthorizeMiddleware } from "@/infra/http/middlewares/authorize.middleware";
import { ValidateWorkspaceMiddleware } from "@/infra/http/middlewares/validate-workspace.middleware";
import { UpdateWorkspaceMemberRoleCommand } from "@/modules/workspace/application/commands/update-workspace-member-role/command";
import { UpdateWorkspaceMemberRoleSchema } from "@/modules/workspace/application/dtos/update-workspace-member-role.dto";
import { CannotUpdateOwnerRoleError } from "@/modules/workspace/application/errors/cannot-update-owner-role.error";
import { WorkspaceMemberNotFoundError } from "@/modules/workspace/application/errors/workspace-member-not-found.error";

type OnError = WorkspaceMemberNotFoundError | CannotUpdateOwnerRoleError;

@injectable()
export class UpdateWorkspaceMemberRoleController implements Controller {
  public readonly path = "/workspaces/:workspaceId/members/:memberId";
  public readonly method: HttpMethod = "patch";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
    @inject(InjectionTokens.Middlewares.ValidateWorkspace)
    private readonly validateWorkspace: ValidateWorkspaceMiddleware,
    @inject(InjectionTokens.Middlewares.Authorize)
    private readonly authorize: AuthorizeMiddleware,
  ) {
    this.middlewares = [
      auth.handle(),
      validateWorkspace.handle(),
      authorize.handle(["workspace:manage"]),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { workspaceId, memberId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId) || !memberId || Array.isArray(memberId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.WorkspaceMember.NotFound });
    }

    const { role } = UpdateWorkspaceMemberRoleSchema.parse(req.body);

    const result = await this.commandBus.dispatch<Either<OnError, void>>(
      new UpdateWorkspaceMemberRoleCommand(workspaceId, memberId, role),
    );

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof WorkspaceMemberNotFoundError) {
        throw new HttpException({
          statusCode: 404,
          message: HttpMessages.WorkspaceMember.NotFound,
        });
      }

      throw new HttpException({
        statusCode: 422,
        message: HttpMessages.WorkspaceMember.CannotUpdateOwnerRole,
      });
    }

    return res.status(204).send();
  }
}
