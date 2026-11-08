import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  HISTORY_PAGE_SIZE,
  type HistoryFilters,
} from "../../domain/history/filters";
import { api, type TransactionsQuery } from "../../infrastructure/api";
import { queryKeys } from "../../shared/queryKeys";

function toQuery(
  filters: HistoryFilters,
  pageSize: number,
): TransactionsQuery {
  return {
    accountId: filters.accountId || undefined,
    type: filters.type || undefined,
    category: filters.category || undefined,
    status: filters.status || undefined,
    search: filters.search || undefined,
    page: filters.page,
    pageSize,
  };
}

export function useTransactions(
  filters: HistoryFilters,
  pageSize = HISTORY_PAGE_SIZE,
) {
  const query = toQuery(filters, pageSize);

  return useQuery({
    queryKey: queryKeys.transactions(query),
    queryFn: () => api.getTransactions(query),
    placeholderData: keepPreviousData,
  });
}

/**
 * Las transferencias pendientes son lo único que puede quedar "en curso".
 * Se refrescan solas para que el aviso desaparezca al liquidarse.
 */
export function usePendingTransfers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.pendingTransfers,
    queryFn: () =>
      api.getTransactions({ status: "pending", page: 1, pageSize: 3 }),
    enabled,
    refetchInterval: 2000,
  });
}
