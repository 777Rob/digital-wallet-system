export interface User {
  id: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  id: string;
  name: string;
  balance: number;
  currency: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export type BetStatus = "win" | "lost" | "canceled";

export interface Bet {
  id: string;
  userId: string;
  amount: number;
  winAmount: number | null;
  status: BetStatus;
  createdAt: string;
}

export type TransactionType =
  | "bet"
  | "win"
  | "cancel"
  | "deposit"
  | "withdrawal"
  | "promo";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  relatedId?: string;
  createdAt: string;
}
