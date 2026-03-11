import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { Bet } from "../../types";

export const usePlaceBetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { amount: number }) => {
      const response = await apiClient.post<Bet>("/bet", values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-bets"] });
      queryClient.invalidateQueries({ queryKey: ["my-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["my-bets"] });
    },
  });
};

export const useCancelBetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/my-bet/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bets"] });
      queryClient.invalidateQueries({ queryKey: ["my-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["recent-bets"] });
    },
  });
};
