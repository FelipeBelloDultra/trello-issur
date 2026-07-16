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
import { RemoveWorkspaceMemberCommand } from "@/modules/workspace/application/commands/remove-workspace-member/command";
import { CannotRemoveSelfError } from "@/modules/workspace/application/errors/cannot-remove-self.error";
import { CannotRemoveWorkspaceOwnerError } from "@/modules/workspace/application/errors/cannot-remove-workspace-owner.error";
import { WorkspaceMemberNotFoundError } from "@/modules/workspace/application/errors/workspace-member-not-found.error";

type OnError =
  | WorkspaceMemberNotFoundError
  | CannotRemoveWorkspaceOwnerError
  | CannotRemoveSelfError;

@injectable()
export class RemoveWorkspaceMemberController implements Controller {
  public readonly path = "/workspaces/:workspaceId/members/:memberId";
  public readonly method: HttpMethod = "delete";
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
      authorize.handle(["workspace:remove-member"]),
    ];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { workspaceId, memberId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId) || !memberId || Array.isArray(memberId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.WorkspaceMember.NotFound });
    }

    const result = await this.commandBus.dispatch<Either<OnError, void>>(
      new RemoveWorkspaceMemberCommand(memberId, workspaceId, req.account!.sub),
    );

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof WorkspaceMemberNotFoundError) {
        throw new HttpException({
          statusCode: 404,
          message: HttpMessages.WorkspaceMember.NotFound,
        });
      }

      if (error instanceof CannotRemoveSelfError) {
        throw new HttpException({
          statusCode: 422,
          message: HttpMessages.WorkspaceMember.CannotRemoveSelf,
        });
      }

      throw new HttpException({
        statusCode: 422,
        message: HttpMessages.WorkspaceMember.CannotRemoveOwner,
      });
    }

    return res.status(204).send();
  }
}
