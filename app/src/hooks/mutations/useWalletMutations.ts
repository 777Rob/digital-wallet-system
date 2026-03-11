import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";

interface TopUpResponse {
  transactionId: string;
  balance: number;
  currency: string;
}

interface PromoCodeResponse {
  transactionId: string;
  balance: number;
  currency: string;
  amount: number;
  description: string;
}

export const useTopUpMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { amount: number }) => {
      const response = await apiClient.post<TopUpResponse>("/top-up", values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-transactions"] });
    },
  });
};

export const usePromoCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { code: string }) => {
      const response = await apiClient.post<PromoCodeResponse>(
        "/promo-code",
        values,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-transactions"] });
    },
  });
};
