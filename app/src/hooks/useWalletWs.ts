import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";
import { useWalletStore } from "../store/useWalletStore";
import { WS_BASE_URL } from "../config/constants";

export const useWalletWs = () => {
  const user = useAuthStore((state) => state.user);
  const setBalance = useWalletStore((state) => state.setBalance);

  useEffect(() => {
    if (!user) return;

    const socket = io(WS_BASE_URL);

    socket.on("balance_update", (data: { userId: string; balance: number }) => {
      if (data.userId === user.id) {
        setBalance(data.balance);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, setBalance]);
};
