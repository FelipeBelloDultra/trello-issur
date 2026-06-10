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
import { InviteMemberCommand } from "@/modules/workspace/application/commands/invite-member/command";
import { InviteMemberSchema } from "@/modules/workspace/application/dtos/invite-member.dto";
import { InviteAlreadyPendingError } from "@/modules/workspace/application/errors/invite-already-pending.error";
import { WorkspaceInvite } from "@/modules/workspace/domain/entities/workspace-invite";

type OnError = InviteAlreadyPendingError;

@injectable()
export class InviteMemberController implements Controller {
  public readonly path = "/workspaces/:workspaceId/invites";
  public readonly method: HttpMethod = "post";
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
    const { workspaceId } = req.params;

    if (!workspaceId || Array.isArray(workspaceId)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.Workspace.NotFound });
    }

    const { email, role } = InviteMemberSchema.parse(req.body);

    const result = await this.commandBus.dispatch<Either<OnError, { invite: WorkspaceInvite }>>(
      new InviteMemberCommand({ workspaceId, invitedByAccountId: req.account!.sub, email, role }),
    );

    if (result.isLeft()) {
      throw new HttpException({
        statusCode: 409,
        message: HttpMessages.WorkspaceInvite.AlreadyPending,
      });
    }

    return res.status(201).json({ id: result.value.invite.id.toValue() });
  }
}
