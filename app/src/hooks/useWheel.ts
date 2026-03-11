import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { apiClient } from "../api/client";
interface WheelStatus {
  availableSpins: number;
  lastFreeSpinClaimDate: string | null;
  betAmountTowardsSpin: number;
}

interface ClaimResponse {
  availableSpins: number;
  lastFreeSpinClaimDate: string | null;
}

interface SpinResponse {
  wonAmount: number;
  balance: number;
  availableSpins: number;
}

export const useWheel = () => {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const statusQuery = useQuery<WheelStatus>({
    queryKey: ["wheel-status"],
    queryFn: async () => {
      const response = await apiClient.get<WheelStatus>("/wheel-status");
      return response.data;
    },
    enabled: !!token,
  });

  const claimMutation = useMutation<ClaimResponse, Error>({
    mutationFn: async () => {
      const response = await apiClient.post<ClaimResponse>("/wheel/claim-free");
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["wheel-status"],
        (old: WheelStatus | undefined) => {
          if (!old) return old;
          return {
            ...old,
            availableSpins: data.availableSpins,
            lastFreeSpinClaimDate: data.lastFreeSpinClaimDate,
          };
        },
      );
    },
  });

  const spinMutation = useMutation<SpinResponse, Error>({
    mutationFn: async () => {
      const response = await apiClient.post<SpinResponse>("/wheel/spin");
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["wheel-status"],
        (old: WheelStatus | undefined) => {
          if (!old) return old;
          return {
            ...old,
            availableSpins: data.availableSpins,
          };
        },
      );
      // Note: The global balance is updated via WebSockets from the backend automatically,
      // see useWalletWs hook.
    },
  });

  return {
    statusQuery,
    claimMutation,
    spinMutation,
  };
};
