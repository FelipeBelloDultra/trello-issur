import { AccountRoleRepository } from "@/modules/auth/application/repositories/account-role.repository";
import { RawPermissionKey } from "@/modules/auth/domain/value-objects/permission-key";

export class InMemoryAccountRoleRepository implements AccountRoleRepository {
  private items: Map<string, RawPermissionKey[]> = new Map();
  private roles: Map<string, string> = new Map();

  public seed(
    accountId: string,
    workspaceId: string,
    permissions: RawPermissionKey[],
    role = "member",
  ): void {
    this.items.set(`${accountId}:${workspaceId}`, permissions);
    this.roles.set(`${accountId}:${workspaceId}`, role);
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

  public async findRole(accountId: string, workspaceId: string): Promise<string | null> {
    return Promise.resolve(this.roles.get(`${accountId}:${workspaceId}`) ?? null);
  }
}
