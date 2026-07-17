import { useParams } from "@tanstack/react-router";

import { useWorkspaceMembersQuery } from "@/entities/workspace";

import { MembersPageSkeleton } from "./members-page-skeleton";

export function MembersPage() {
  const { workspaceId } = useParams({ strict: false });
  const { data: members, isLoading } = useWorkspaceMembersQuery(workspaceId ?? "");

  if (isLoading) {
    return <MembersPageSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold">Members</h1>

      <div className="border-border overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member) => (
              <tr key={member.id} className="border-border border-t">
                <td className="px-4 py-2">{member.account_name}</td>
                <td className="text-muted-foreground px-4 py-2">{member.account_email}</td>
                <td className="px-4 py-2 capitalize">{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
