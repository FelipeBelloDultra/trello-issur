import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { Either } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { CreateWorkspaceCommand } from "@/modules/workspace/application/commands/create-workspace/command";
import { CreateWorkspaceDto } from "@/modules/workspace/application/dtos/create-workspace.dto";
import { WorkspaceSlugAlreadyTakenError } from "@/modules/workspace/application/errors/workspace-slug-already-taken.error";
import { Workspace } from "@/modules/workspace/domain/entities/workspace";

import { WorkspacePresenter } from "../../presenters/workspace.presenter";

@injectable()
export class CreateWorkspaceController implements Controller {
  public readonly path = "/workspaces";
  public readonly method: HttpMethod = "post";
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
    if (!req.account) {
      throw new HttpException({ statusCode: 401, message: "Unauthorized" });
    }

    const dto = CreateWorkspaceDto.parse(req.body);
    const result = await this.commandBus.dispatch<
      Either<WorkspaceSlugAlreadyTakenError, { workspace: Workspace }>
    >(new CreateWorkspaceCommand({ name: dto.name, ownerId: req.account.sub, isPersonal: false, description: dto.description }));

    if (result.isRight()) {
      return res.status(201).json({ data: WorkspacePresenter.toHTTP(result.value.workspace) });
    }

    switch (result.value.constructor) {
      case WorkspaceSlugAlreadyTakenError:
        throw new HttpException({ statusCode: 409, message: result.value.message });
      default:
        throw new Error();
    }
  }
}
