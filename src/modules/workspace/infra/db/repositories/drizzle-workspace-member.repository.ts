import { eq } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { accountRoles } from "@/infra/db/schema/account-roles";
import { roles } from "@/infra/db/schema/roles";
import {
  WorkspaceMemberRepository,
  WorkspaceMemberRole,
} from "@/modules/workspace/application/repositories/workspace-member.repository";

@injectable()
export class DrizzleWorkspaceMemberRepository implements WorkspaceMemberRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
  ) {}

  public async create(
    workspaceId: string,
    accountId: string,
    role: WorkspaceMemberRole,
  ): Promise<void> {
    const [roleRow] = await this.db.query
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, role))
      .limit(1);

    if (!roleRow) {
      throw new Error(`Role "${role}" not found`);
    }

    await this.db.query.insert(accountRoles).values({ accountId, roleId: roleRow.id, workspaceId });
  }
}
