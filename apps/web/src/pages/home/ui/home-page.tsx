import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAccountQuery } from "@/entities/account";
import { useAuthStore } from "@/shared/lib/auth-store";

export function HomePage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: account, isLoading } = useAccountQuery();

  useEffect(() => {
    if (accessToken === null) {
      void navigate({ to: "/login" });
    }
  }, [accessToken, navigate]);

  if (accessToken === null || isLoading) {
    return null;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-4">
      <h1 className="text-2xl font-semibold">Welcome, {account?.name}</h1>
      <p className="text-muted-foreground">{account?.email}</p>
    </div>
  );
}
