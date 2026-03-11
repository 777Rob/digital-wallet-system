import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const storeFn: StateCreator<AuthState> = (set) => ({
  token: null,
  user: null,
  setAuth: (token: string, user: User) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
});

export const useAuthStore = create<AuthState>()(
  persist(storeFn, { name: "auth-storage" }),
);
