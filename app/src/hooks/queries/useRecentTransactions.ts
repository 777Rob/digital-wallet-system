import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { PaginatedResponse, Transaction } from "../../types";

export const useRecentTransactions = (limit: number = 5) => {
  return useQuery({
    queryKey: ["recent-transactions", limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Transaction>>(
        "/my-transactions",
        { params: { page: 1, limit } },
      );
      return response.data;
    },
  });
};
