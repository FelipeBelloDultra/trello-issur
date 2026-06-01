import { render } from "@react-email/render";

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
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
            Welcome to Trello Issur, {name}!
          </h1>
          <p style={{ fontSize: "16px", color: "#374151", lineHeight: "1.6" }}>
            Your account has been created successfully.
          </p>
          <p style={{ fontSize: "16px", color: "#374151", lineHeight: "1.6" }}>
            Start managing your projects and collaborating with your team today.
          </p>
        </div>
      </body>
    </html>
  );
}

export async function renderWelcomeEmail(name: string): Promise<string> {
  return render(<WelcomeEmail name={name} />);
}
