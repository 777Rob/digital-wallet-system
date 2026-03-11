import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";
import { useWalletStore } from "../store/useWalletStore";
import { WS_BASE_URL } from "../config/constants";
import { apiClient } from "../api/client";

export const useWalletWs = () => {
  const user = useAuthStore((state) => state.user);
  const setBalance = useWalletStore((state) => state.setBalance);

  useEffect(() => {
    if (!user) return;

    if (WS_BASE_URL) {
      const socket = io(WS_BASE_URL);

      socket.on("balance_update", (data: { userId: string; balance: number }) => {
        if (data.userId === user.id) {
          setBalance(data.balance);
        }
      });

      return () => {
        socket.disconnect();
      };
    } else {
      // Fallback to HTTP polling if WebSocket is not configured (e.g., on Vercel)
      const fetchBalance = async () => {
        try {
          const { data } = await apiClient.get("/me");
          if (data && typeof data.balance === "number") {
            setBalance(data.balance);
          }
        } catch (e) {
          // Ignore polling errors to prevent console spam
        }
      };

      // Poll every 3 seconds
      const intervalId = setInterval(fetchBalance, 3000);
      
      // Also fetch immediately on mount
      fetchBalance();

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [user, setBalance]);
};
