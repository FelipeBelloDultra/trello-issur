import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { HttpMessages } from "@/infra/http/http-messages";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { RespondToInviteCommand } from "@/modules/workspace/application/commands/respond-to-invite/command";
import { RespondToInviteSchema } from "@/modules/workspace/application/dtos/respond-to-invite.dto";
import { AlreadyAMemberError } from "@/modules/workspace/application/errors/already-a-member.error";
import { InvalidInviteActionError } from "@/modules/workspace/application/errors/invalid-invite-action.error";
import { InviteAlreadyUsedError } from "@/modules/workspace/application/errors/invite-already-used.error";
import { InviteEmailMismatchError } from "@/modules/workspace/application/errors/invite-email-mismatch.error";
import { InviteExpiredError } from "@/modules/workspace/application/errors/invite-expired.error";
import { InviteNotFoundError } from "@/modules/workspace/application/errors/invite-not-found.error";

type OnError =
  | InviteNotFoundError
  | InviteExpiredError
  | InviteAlreadyUsedError
  | InviteEmailMismatchError
  | AlreadyAMemberError
  | InvalidInviteActionError;

@injectable()
export class RespondToInviteController implements Controller {
  public readonly path = "/invites/:token";
  public readonly method: HttpMethod = "patch";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Command)
    private readonly commandBus: CommandBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
  ) {
    this.middlewares = [auth.handle()];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const { token } = req.params;

    if (!token || Array.isArray(token)) {
      throw new HttpException({ statusCode: 404, message: HttpMessages.WorkspaceInvite.NotFound });
    }

    const { action } = RespondToInviteSchema.parse(req.body);

    const result = await this.commandBus.dispatch<Either<OnError, void>>(
      new RespondToInviteCommand({
        token,
        accountId: req.account!.sub,
        accountEmail: req.account!.email,
        action,
      }),
    );

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof InviteNotFoundError) {
        throw new HttpException({
          statusCode: 404,
          message: HttpMessages.WorkspaceInvite.NotFound,
        });
      }

      if (error instanceof InviteExpiredError) {
        throw new HttpException({ statusCode: 410, message: HttpMessages.WorkspaceInvite.Expired });
      }

      if (error instanceof InviteAlreadyUsedError) {
        throw new HttpException({
          statusCode: 409,
          message: HttpMessages.WorkspaceInvite.AlreadyUsed,
        });
      }

      if (error instanceof InviteEmailMismatchError) {
        throw new HttpException({
          statusCode: 403,
          message: HttpMessages.WorkspaceInvite.EmailMismatch,
        });
      }

      if (error instanceof AlreadyAMemberError) {
        throw new HttpException({
          statusCode: 409,
          message: HttpMessages.WorkspaceInvite.AlreadyAMember,
        });
      }

      throw new HttpException({ statusCode: 400, message: HttpMessages.General.ValidationFailed });
    }

    return res.status(204).send();
  }
}
