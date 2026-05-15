import type { StateCreator } from "zustand";

export type UserInfo = {
  email: string;
  countryCode: string;
};

export type AuthSlice = {
  user: UserInfo | null;
  token: string | null;
  verificationExpiresAt: number | null;
  setUser: (user: UserInfo | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (payload: { user: UserInfo; token: string }) => void;
  startVerificationTimer: (expiresInSeconds?: number) => void;
  clearVerificationTimer: () => void;
  clearAuth: () => void;
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  user: null,
  token: null,
  verificationExpiresAt: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setAuth: ({ user, token }) => set({ user, token }),
  startVerificationTimer: (expiresInSeconds = 600) =>
    set({ verificationExpiresAt: Date.now() + expiresInSeconds * 1000 }),
  clearVerificationTimer: () => set({ verificationExpiresAt: null }),
  clearAuth: () => set({ user: null, token: null, verificationExpiresAt: null }),
});
