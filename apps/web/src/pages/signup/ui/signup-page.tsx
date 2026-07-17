import { Link, useNavigate } from "@tanstack/react-router";

import { useAuthenticate } from "@/features/authenticate";
import { RegisterForm } from "@/features/register";

export function SignupPage() {
  const navigate = useNavigate();
  const authenticate = useAuthenticate();

  const handleSuccess = async ({ email, password }: { email: string; password: string }) => {
    try {
      await authenticate.mutateAsync({ email, password });
      void navigate({ to: "/" });
    } catch {
      // Account was created but the auto sign-in failed (e.g. rate limited) —
      // send them to sign in manually instead of leaving them stuck here.
      void navigate({ to: "/login" });
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-[340px] flex-col items-center gap-8">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-semibold">
          TI
        </div>

        <div className="flex w-full flex-col gap-1 text-center">
          <h1 className="text-xl font-medium">Create your account</h1>
          <p className="text-muted-foreground text-sm">Get started with Trello Issur.</p>
        </div>

        <RegisterForm onSuccess={(values) => void handleSuccess(values)} />

        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
