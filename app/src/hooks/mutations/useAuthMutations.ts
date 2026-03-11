import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { AuthResponse } from "../../types";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const response = await apiClient.post<AuthResponse>("/login", values);
      return response.data;
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (values: {
      name: string;
      email: string;
      password: string;
    }) => {
      const response = await apiClient.post("/register", values);
      return response.data;
    },
  });
};
