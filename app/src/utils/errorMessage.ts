import { AxiosError } from "axios";

export const extractErrorMessage = (
  error: Error | AxiosError,
  fallback: string,
): string => {
  if (
    "isAxiosError" in error &&
    (error as AxiosError<{ message?: string }>).response?.data?.message
  ) {
    return (error as AxiosError<{ message?: string }>).response!.data!.message!;
  }
  return fallback;
};
