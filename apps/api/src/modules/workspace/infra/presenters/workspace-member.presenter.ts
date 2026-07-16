import { WorkspaceMemberView } from "@/modules/workspace/application/repositories/workspace-member.repository";

export class WorkspaceMemberPresenter {
  public static toHTTP(member: WorkspaceMemberView) {
    return {
      id: member.id,
      account_id: member.accountId,
      account_name: member.accountName,
      account_email: member.accountEmail,
      role: member.role,
      joined_at: member.joinedAt,
    };
  }
}
