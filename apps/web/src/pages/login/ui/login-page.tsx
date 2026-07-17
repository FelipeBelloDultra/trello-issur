import { Link, useNavigate } from "@tanstack/react-router";

import { LoginForm } from "@/features/authenticate";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-8">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-semibold">
          TI
        </div>

        <div className="flex w-full flex-col gap-1 text-center">
          <h1 className="text-xl font-medium">Sign in to Trello Issur</h1>
          <p className="text-muted-foreground text-sm">Welcome back, enter your credentials.</p>
        </div>

        <LoginForm onSuccess={() => void navigate({ to: "/" })} />

        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-foreground font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
