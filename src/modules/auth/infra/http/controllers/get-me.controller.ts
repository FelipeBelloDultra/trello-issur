import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "tsyringe";

import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { Controller, HttpMethod } from "@/infra/http/contracts/controller";
import { HttpException } from "@/infra/http/http-exception";
import { AuthMiddleware } from "@/infra/http/middlewares/auth.middleware";
import { GetAccountQuery } from "@/modules/account/application/queries/get-account/query";
import { Account } from "@/modules/account/domain/entities/account";
import { AccountPresenter } from "@/modules/account/infra/presenters/account.presenter";

@injectable()
export class GetMeController implements Controller {
  public readonly path = "/auth/me";
  public readonly method: HttpMethod = "get";
  public readonly middlewares: RequestHandler[];

  public constructor(
    @inject(InjectionTokens.Bus.Query)
    private readonly queryBus: QueryBus,
    @inject(InjectionTokens.Middlewares.Auth)
    private readonly auth: AuthMiddleware,
  ) {
    this.middlewares = [this.auth.handle()];
  }

  public async handler(req: Request, res: Response): Promise<Response> {
    const account = await this.queryBus.ask<Account | null>(new GetAccountQuery(req.account!.sub));

    if (!account) {
      throw new HttpException({ statusCode: 404, message: "Account not found" });
    }

    return res.status(200).json(AccountPresenter.toHTTP(account));
  }
}
