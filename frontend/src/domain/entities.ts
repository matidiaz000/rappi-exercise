export type Currency = "ARS" | "USD" | "EUR";

export type TransactionType = "income" | "expense" | "transfer";

export type TransactionStatus = "pending" | "completed" | "failed";

export type TransferDirection = "in" | "out";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  token: string;
  user: AuthUser;
  loggedInAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  currency: Currency;
  createdAt: string;
  balance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  direction: TransferDirection | null;
  amount: number;
  currency: Currency;
  category: string | null;
  description: string | null;
  status: TransactionStatus;
  counterpartAccountId: string | null;
  transferId: string | null;
  createdAt: string;
}

export interface Transfer {
  id: string;
  status: TransactionStatus;
  from: Transaction | null;
  to: Transaction | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface TransactionPage {
  transactions: Transaction[];
  pagination: Pagination;
}

export interface NewTransactionInput {
  accountId: string;
  type: "income" | "expense";
  amount: number;
  category?: string;
  description?: string;
}

export interface NewTransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}
