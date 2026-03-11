import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { Bet, PaginatedResponse } from "../../types";

interface UseBetsParams {
  page?: number;
  limit?: number;
  status?: string | null;
  id?: string;
  enabled?: boolean;
}

export const useBets = ({
  page = 1,
  limit = 10,
  status,
  id,
  enabled = true,
}: UseBetsParams = {}) => {
  return useQuery({
    queryKey: ["my-bets", page, status, id, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Bet>>("/my-bets", {
        params: {
          page,
          limit,
          ...(status && status !== "all" ? { status } : {}),
          ...(id ? { id } : {}),
        },
      });
      return response.data;
    },
    enabled,
  });
};

export const useRecentBets = (limit: number = 5) => {
  return useQuery({
    queryKey: ["recent-bets", limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Bet>>("/my-bets", {
        params: { page: 1, limit },
      });
      return response.data;
    },
  });
};
