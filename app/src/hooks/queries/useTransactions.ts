import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { PaginatedResponse, Transaction } from "../../types";

interface UseTransactionsParams {
  page?: number;
  limit?: number;
  type?: string | null;
  id?: string;
}

export const useTransactions = ({
  page = 1,
  limit = 10,
  type,
  id,
}: UseTransactionsParams = {}) => {
  return useQuery({
    queryKey: ["my-transactions", page, type, id, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Transaction>>(
        "/my-transactions",
        {
          params: {
            page,
            limit,
            ...(type && type !== "all" ? { type } : {}),
            ...(id ? { id } : {}),
          },
        },
      );
      return response.data;
    },
  });
};
