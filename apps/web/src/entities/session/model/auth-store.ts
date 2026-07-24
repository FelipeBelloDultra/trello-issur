import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Account } from "./types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: Account | null;
  setAuthenticated: (user: Account) => void;
  setUnauthenticated: () => void;
}

// immer middleware wired in ahead of need — this store is flat today, but
// it's the pattern future stores with nested state should follow, so it's
// set up once here rather than retrofitted later under pressure.
export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    status: "loading",
    user: null,
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
  })),
);
