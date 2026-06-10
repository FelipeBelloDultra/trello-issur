import { render } from "@react-email/render";

import { env } from "@/config/env";
import { WorkspaceMemberRole } from "@/modules/workspace/domain/value-objects/workspace-member-role";

interface InviteEmailProps {
  invitedByName: string;
  workspaceName: string;
  role: WorkspaceMemberRole;
  token: string;
  expiresAt: Date;
}

function InviteEmail({ invitedByName, workspaceName, role, token, expiresAt }: InviteEmailProps) {
  const acceptUrl = `${env.APP_URL}/invites/${token}`;
  const expiresFormatted = expiresAt.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <html lang="en">
      <head />
      <body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb", margin: 0, padding: 0 }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "40px auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "40px",
          }}
        >
          <h1 style={{ fontSize: "24px", color: "#111827", marginBottom: "16px" }}>
            You have been invited to join {workspaceName}
          </h1>
          <p style={{ fontSize: "16px", color: "#374151", lineHeight: "1.6" }}>
            <strong>{invitedByName}</strong> has invited you to join{" "}
            <strong>{workspaceName}</strong> as <strong>{role}</strong>.
          </p>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            This invite expires on {expiresFormatted}.
          </p>
          <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
            <a
              href={`${acceptUrl}?action=accept`}
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "600",
                marginRight: "12px",
              }}
            >
              Accept invite
            </a>
            <a
              href={`${acceptUrl}?action=reject`}
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Decline
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

export async function renderInviteEmail(props: InviteEmailProps): Promise<string> {
  return render(<InviteEmail {...props} />);
}
