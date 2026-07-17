import { Link } from "@tanstack/react-router";

import { Button } from "@/shared/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-[340px] flex-col items-center gap-6 text-center">
        <span className="text-muted-foreground text-6xl font-semibold">404</span>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-medium">Page not found</h1>
          <p className="text-muted-foreground text-sm">
            The page you&apos;re looking for doesn&apos;t exist or was moved.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link to="/">Back to safety</Link>
        </Button>
      </div>
    </div>
  );
}
