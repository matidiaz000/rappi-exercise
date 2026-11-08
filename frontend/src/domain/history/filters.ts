import type { TransactionStatus, TransactionType } from "../entities";

export const HISTORY_PAGE_SIZE = 10;

export interface HistoryFilters {
  accountId: string;
  type: "" | TransactionType;
  category: string;
  status: "" | TransactionStatus;
  search: string;
  page: number;
}

export const EMPTY_HISTORY_FILTERS: HistoryFilters = {
  accountId: "",
  type: "",
  category: "",
  status: "",
  search: "",
  page: 1,
};

const TRANSACTION_TYPES: readonly string[] = ["income", "expense", "transfer"];
const TRANSACTION_STATUSES: readonly string[] = [
  "pending",
  "completed",
  "failed",
];

function pickEnum<T extends string>(
  value: string | null,
  allowed: readonly string[],
): T | "" {
  return value && allowed.includes(value) ? (value as T) : "";
}

export function parseHistoryFilters(params: URLSearchParams): HistoryFilters {
  const rawPage = Number(params.get("page"));
  const page =
    Number.isInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 10_000) : 1;

  return {
    accountId: params.get("accountId")?.trim() ?? "",
    type: pickEnum<TransactionType>(params.get("type"), TRANSACTION_TYPES),
    category: params.get("category")?.trim() ?? "",
    status: pickEnum<TransactionStatus>(
      params.get("status"),
      TRANSACTION_STATUSES,
    ),
    search: (params.get("search") ?? "").trim().slice(0, 120),
    page,
  };
}

export function historyFiltersToParams(filters: HistoryFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.accountId) params.set("accountId", filters.accountId);
  if (filters.type) params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));

  return params;
}

export function updateHistoryFilters(
  current: HistoryFilters,
  patch: Partial<HistoryFilters>,
): HistoryFilters {
  const changedFilters = Object.keys(patch).some((key) => key !== "page");
  return {
    ...current,
    ...patch,
    page: changedFilters ? 1 : (patch.page ?? current.page),
  };
}

export function hasActiveFilters(filters: HistoryFilters): boolean {
  return Boolean(
    filters.accountId ||
      filters.type ||
      filters.category ||
      filters.status ||
      filters.search,
  );
}

export function getTotalPages(total: number, pageSize = HISTORY_PAGE_SIZE): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampPage(page: number, total: number, pageSize = HISTORY_PAGE_SIZE): number {
  return Math.min(Math.max(1, page), getTotalPages(total, pageSize));
}
