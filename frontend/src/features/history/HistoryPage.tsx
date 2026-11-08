import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { TransactionStatus, TransactionType } from "../../domain/entities";
import {
  getTotalPages,
  hasActiveFilters,
  historyFiltersToParams,
  parseHistoryFilters,
  updateHistoryFilters,
  type HistoryFilters,
} from "../../domain/history/filters";
import { CATEGORY_OPTIONS } from "../../domain/transactions/categories";
import { getErrorMessage } from "../../shared/errorMessage";
import { useDebouncedValue } from "../../shared/useDebouncedValue";
import { useDocumentTitle } from "../../shared/useDocumentTitle";
import { Button } from "../../ui/Button";
import { Input, Select } from "../../ui/form";
import { PageHeader } from "../../ui/PageHeader";
import {
  EmptyState,
  ErrorState,
  InlineNotice,
  Skeleton,
} from "../../ui/States";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LedgerIcon,
  PlusIcon,
  SearchIcon,
} from "../../ui/icons";
import { useAccounts } from "../accounts/useAccounts";
import { NewMovementDialog } from "../transactions/NewMovementDialog";
import { TransactionRow } from "../transactions/TransactionRow";
import { TransactionTable } from "../transactions/TransactionTable";
import { useTransactions } from "../transactions/useTransactions";

const TYPE_OPTIONS: Array<{ value: HistoryFilters["type"]; label: string }> = [
  { value: "", label: "Todos los tipos" },
  { value: "income", label: "Ingresos" },
  { value: "expense", label: "Gastos" },
  { value: "transfer", label: "Transferencias" },
];

const STATUS_OPTIONS: Array<{
  value: HistoryFilters["status"];
  label: string;
}> = [
  { value: "", label: "Todos los estados" },
  { value: "completed", label: "Completados" },
  { value: "pending", label: "En curso" },
  { value: "failed", label: "Fallidos" },
];

export function HistoryPage() {
  useDocumentTitle("Historial");
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseHistoryFilters(searchParams);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [movementOpen, setMovementOpen] = useState(false);
  const accountsQuery = useAccounts();
  const accounts = useMemo(
    () => accountsQuery.data ?? [],
    [accountsQuery.data],
  );
  const transactionQuery = useTransactions(filters);

  useEffect(() => {
    setSearchInput((current) =>
      current === filters.search ? current : filters.search,
    );
  }, [filters.search]);

  useEffect(() => {
    const normalized = debouncedSearch.trim();
    if (normalized === filters.search) return;

    const next = updateHistoryFilters(filters, { search: normalized });
    setSearchParams(historyFiltersToParams(next), { replace: true });
  }, [debouncedSearch, filters, setSearchParams]);

  const accountNameById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );

  function applyFilters(patch: Partial<HistoryFilters>) {
    const next = updateHistoryFilters(filters, patch);
    setSearchParams(historyFiltersToParams(next), { replace: true });
  }

  function clearFilters() {
    setSearchInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  const isFiltered = hasActiveFilters(filters);
  const total = transactionQuery.data?.pagination.total ?? 0;
  const totalPages = getTotalPages(total);
  const page = filters.page;
  const pageTransactions = transactionQuery.data?.transactions ?? [];

  return (
    <div>
      <PageHeader
        title="Historial"
        description="Todos tus ingresos, gastos y transferencias. Filtrá por cuenta, tipo, categoría o estado."
        actions={
          <Button
            onClick={() => setMovementOpen(true)}
            disabled={accounts.length === 0}
          >
            <PlusIcon className="size-4" />
            Nuevo movimiento
          </Button>
        }
      />

      <section
        className="mt-6 rounded-2xl border border-line bg-surface p-4"
        aria-label="Filtros del historial"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor="history-search" className="sr-only">
              Buscar por descripción
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="history-search"
                type="search"
                placeholder="Buscar por descripción…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-10"
                maxLength={120}
              />
            </div>
          </div>

          <div className="w-full sm:w-48">
            <label htmlFor="history-account" className="sr-only">
              Filtrar por cuenta
            </label>
            <Select
              id="history-account"
              value={filters.accountId}
              onChange={(event) =>
                applyFilters({ accountId: event.target.value })
              }
            >
              <option value="">Todas las cuentas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.currency})
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <label htmlFor="history-type" className="sr-only">
              Filtrar por tipo
            </label>
            <Select
              id="history-type"
              value={filters.type}
              onChange={(event) =>
                applyFilters({ type: event.target.value as TransactionType | "" })
              }
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <label htmlFor="history-category" className="sr-only">
              Filtrar por categoría
            </label>
            <Select
              id="history-category"
              value={filters.category}
              onChange={(event) =>
                applyFilters({ category: event.target.value })
              }
            >
              <option value="">Todas las categorías</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <label htmlFor="history-status" className="sr-only">
              Filtrar por estado
            </label>
            <Select
              id="history-status"
              value={filters.status}
              onChange={(event) =>
                applyFilters({
                  status: event.target.value as TransactionStatus | "",
                })
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {isFiltered ? (
            <Button variant="ghost" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </section>

      <section
        className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface"
        aria-labelledby="history-results-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
          <h2
            id="history-results-title"
            className="text-sm font-medium text-ink"
          >
            {transactionQuery.isPending
              ? "Cargando movimientos…"
              : `${total} ${total === 1 ? "movimiento" : "movimientos"}`}
          </h2>
          <p className="text-xs text-ink-muted" aria-live="polite">
            {transactionQuery.isFetching && !transactionQuery.isPending
              ? "Actualizando…"
              : `Página ${page} de ${totalPages}`}
          </p>
        </div>

        {transactionQuery.isPending ? (
          <div className="space-y-3 p-4 sm:p-5">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-56 max-w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : transactionQuery.isError ? (
          <div className="p-4 sm:p-5">
            <ErrorState
              message={getErrorMessage(
                transactionQuery.error,
                "No pudimos cargar el historial.",
              )}
              onRetry={() => transactionQuery.refetch()}
            />
          </div>
        ) : pageTransactions.length === 0 ? (
          <div className="p-4 sm:p-5">
            {isFiltered ? (
              <EmptyState
                icon={<SearchIcon />}
                title="No encontramos movimientos"
                message="Probá con otros filtros o limpiá la búsqueda para ver todo el historial."
                action={
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<LedgerIcon />}
                title="Todavía no hay movimientos"
                message="Registrá un ingreso o un gasto para empezar a ver tu historial."
                action={
                  <Button
                    size="sm"
                    onClick={() => setMovementOpen(true)}
                    disabled={accounts.length === 0}
                  >
                    <PlusIcon className="size-4" />
                    Nuevo movimiento
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <>
            {page > totalPages ? (
              <div className="px-4 pt-4 sm:px-5">
                <InlineNotice tone="warning">
                  Esta página ya no existe para los filtros actuales.{" "}
                  <button
                    type="button"
                    onClick={() => applyFilters({ page: 1 })}
                    className="font-medium underline underline-offset-4"
                  >
                    Volver a la primera página
                  </button>
                </InlineNotice>
              </div>
            ) : null}

            <div className="hidden md:block px-4 py-2 sm:px-5">
              <TransactionTable
                transactions={pageTransactions}
                accountNameById={accountNameById}
              />
            </div>

            <ul className="divide-y divide-line/70 px-4 md:hidden">
              {pageTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  accountName={accountNameById.get(transaction.accountId)}
                  accountNameById={accountNameById}
                />
              ))}
            </ul>
          </>
        )}

        {!transactionQuery.isPending && !transactionQuery.isError && total > 0 ? (
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => applyFilters({ page: page - 1 })}
              disabled={page <= 1 || transactionQuery.isFetching}
            >
              <ChevronLeftIcon className="size-4" />
              Anterior
            </Button>
            <span className="text-xs text-ink-muted">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => applyFilters({ page: page + 1 })}
              disabled={page >= totalPages || transactionQuery.isFetching}
            >
              Siguiente
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        ) : null}
      </section>

      <NewMovementDialog
        open={movementOpen}
        onClose={() => setMovementOpen(false)}
        accounts={accounts}
      />
    </div>
  );
}
