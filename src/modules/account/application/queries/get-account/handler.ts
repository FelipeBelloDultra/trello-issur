import { inject, injectable } from "tsyringe";

import { QueryHandler } from "@/core/queries/query-handler";
import { InjectionTokens } from "@/infra/container/tokens";
import { Account } from "@/modules/account/domain/entities/account";

import { AccountRepository } from "../../repositories/account.repository";

import { GetAccountQuery } from "./query";

@injectable()
export class GetAccountHandler implements QueryHandler<GetAccountQuery, Account | null> {
  public constructor(
    @inject(InjectionTokens.Repositories.Account)
    private readonly accountRepository: AccountRepository,
  ) {}

  public async execute(query: GetAccountQuery): Promise<Account | null> {
    return this.accountRepository.findById(query.accountId);
  }
}
