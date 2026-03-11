import { create, type StateCreator } from "zustand";

interface WalletState {
  balance: number;
  currency: string;
  setBalance: (balance: number) => void;
  setCurrency: (currency: string) => void;
}

const storeFn: StateCreator<WalletState> = (set) => ({
  balance: 0,
  currency: "EUR",
  setBalance: (balance: number) => set({ balance }),
  setCurrency: (currency: string) => set({ currency }),
});

export const useWalletStore = create<WalletState>()(storeFn);
