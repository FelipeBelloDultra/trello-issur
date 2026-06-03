import { AccountRoleRepository } from "@/modules/auth/application/repositories/account-role.repository";
import { RawPermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

export class InMemoryAccountRoleRepository implements AccountRoleRepository {
  private items: Map<string, RawPermissionKey[]> = new Map();

  public seed(accountId: string, workspaceId: string, permissions: RawPermissionKey[]): void {
    this.items.set(`${accountId}:${workspaceId}`, permissions);
  }

  public async isMember(accountId: string, workspaceId: string): Promise<boolean> {
    return Promise.resolve(this.items.has(`${accountId}:${workspaceId}`));
  }

  public async findPermissions(
    accountId: string,
    workspaceId: string,
  ): Promise<RawPermissionKey[]> {
    return Promise.resolve(this.items.get(`${accountId}:${workspaceId}`) ?? []);
  }
}
