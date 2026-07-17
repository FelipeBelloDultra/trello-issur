import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { cn } from "@/shared/lib/utils";

const HIDE_DELAY_MS = 400;

// YouTube-style top progress bar driven by the router's own pending state —
// fires on every navigation (route transition, beforeLoad/loader in flight,
// or a lazy route chunk downloading), not tied to any one query. Width/opacity
// are pure CSS transitions keyed off `isPending`; the only JS state is
// mount/unmount, deferred into a timeout so state updates never happen
// synchronously inside the effect body (react-hooks/set-state-in-effect).
export function RouteProgressBar() {
  const isPending = useRouterState({ select: (s) => s.status === "pending" });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isPending) {
      const timer = setTimeout(() => setShow(true), 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setShow(false), HIDE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isPending]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div
        className={cn(
          "h-full bg-red-500 ease-out",
          isPending
            ? "w-[85%] transition-[width] duration-[6000ms]"
            : "w-full opacity-0 transition-[width,opacity] delay-150 duration-200",
        )}
        style={{ boxShadow: "0 0 8px rgba(239,68,68,0.7)" }}
      />
    </div>
  );
}
