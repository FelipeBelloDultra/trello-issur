import { useNavigate } from "@tanstack/react-router";

import { LoginForm } from "@/features/authenticate";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm onSuccess={() => void navigate({ to: "/" })} />
        </CardContent>
      </Card>
    </div>
  );
}
