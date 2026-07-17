import { inject, injectable } from "tsyringe";

import { QueryHandler } from "@/core/queries/query-handler";
import { InjectionTokens } from "@/infra/container/tokens";
import { AccountRoleRepository } from "@/modules/auth/application/repositories/account-role.repository";
import { RawPermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

import { GetMyMembershipQuery } from "./query";

export interface MembershipView {
  role: string;
  permissions: RawPermissionKey[];
}

@injectable()
export class GetMyMembershipHandler implements QueryHandler<GetMyMembershipQuery, MembershipView> {
  public constructor(
    @inject(InjectionTokens.Repositories.AccountRole)
    private readonly accountRoleRepository: AccountRoleRepository,
  ) {}

  public async execute(query: GetMyMembershipQuery): Promise<MembershipView> {
    const [role, permissions] = await Promise.all([
      this.accountRoleRepository.findRole(query.accountId, query.workspaceId),
      this.accountRoleRepository.findPermissions(query.accountId, query.workspaceId),
    ]);

    return { role: role ?? "member", permissions };
  }
}
