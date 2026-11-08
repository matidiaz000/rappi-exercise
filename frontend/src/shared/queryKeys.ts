import type { TransactionsQuery } from "../infrastructure/api/fintechApi";

export const queryKeys = {
  accounts: ["accounts"] as const,
  categories: ["categories"] as const,
  transactions: (query: TransactionsQuery) => ["transactions", query] as const,
  pendingTransfers: ["transactions", "pending"] as const,
  transfer: (transferId: string) => ["transfer", transferId] as const,
};
