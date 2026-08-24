import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Account } from "./types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: Account | null;
  // True for the span of a hard session transition (login/logout — mutation
  // through the resulting navigation), not for ordinary route changes. Only
  // ever written by withSessionTransition (model/with-session-transition.ts)
  // — that single writer is what keeps this from getting stuck true.
  isTransitioning: boolean;
  setAuthenticated: (user: Account) => void;
  setUnauthenticated: () => void;
  setTransitioning: (value: boolean) => void;
}

// immer middleware wired in ahead of need — this store is flat today, but
// it's the pattern future stores with nested state should follow, so it's
// set up once here rather than retrofitted later under pressure.
export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    status: "loading",
    user: null,
    isTransitioning: false,
    setAuthenticated: (user) =>
      set((state) => {
        state.status = "authenticated";
        state.user = user;
      }),
    setUnauthenticated: () =>
      set((state) => {
        state.status = "unauthenticated";
        state.user = null;
      }),
    setTransitioning: (value) =>
      set((state) => {
        state.isTransitioning = value;
      }),
  })),
);
