import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import createSelectors from "./selector";
import { createAuthSlice, type AuthSlice } from "./auth/auth.slice";

type RootStore = AuthSlice;
type AuthPersistedState = Pick<AuthSlice, "user" | "token" | "verificationExpiresAt">;

const authStorage = createJSONStorage<AuthPersistedState>(() => localStorage);

const useStoreBase = create<RootStore>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
    }),
    {
      name: "rex-session-storage",
      storage: authStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        verificationExpiresAt: state.verificationExpiresAt,
      }),
    }
  )
);

export const useStore = createSelectors(useStoreBase);
export const useAuthStore = useStore;
export const useAuthStoreBase = useStoreBase;

export type Store = RootStore;
