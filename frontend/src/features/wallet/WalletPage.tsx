import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../../shared/errorMessage";
import { formatDateTime } from "../../domain/format";
import {
  CURRENCY_NAMES,
  groupBalancesByCurrency,
} from "../../domain/money/balances";
import { formatCents, toCents } from "../../domain/money/money";
import { EMPTY_HISTORY_FILTERS } from "../../domain/history/filters";
import { useDocumentTitle } from "../../shared/useDocumentTitle";
import { Button, buttonClasses } from "../../ui/Button";
import { CurrencyBadge, Money } from "../../ui/Money";
import { PageHeader } from "../../ui/PageHeader";
import { EmptyState, ErrorState, SecurityNote, Skeleton } from "../../ui/States";
import {
  EyeIcon,
  EyeOffIcon,
  LedgerIcon,
  PlusIcon,
  SendIcon,
  WalletIcon,
} from "../../ui/icons";
import { useAuth } from "../auth/AuthProvider";
import { useAccounts } from "../accounts/useAccounts";
import { NewMovementDialog } from "../transactions/NewMovementDialog";
import { TransactionRow } from "../transactions/TransactionRow";
import { useTransactions } from "../transactions/useTransactions";
import { PendingTransfersBanner } from "./PendingTransfersBanner";

const BALANCE_VISIBILITY_KEY = "cauce.balances.hidden";

function readHiddenPreference(): boolean {
  try {
    return window.localStorage.getItem(BALANCE_VISIBILITY_KEY) === "1";
  } catch {
    return false;
  }
}

function WalletSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <Skeleton className="mt-7 h-64 w-full rounded-3xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function WalletPage() {
  useDocumentTitle("Billetera personal");
  const { user } = useAuth();
  const accountsQuery = useAccounts();
  const recentQuery = useTransactions(
    { ...EMPTY_HISTORY_FILTERS, page: 1 },
    5,
  );
  const [hidden, setHidden] = useState(readHiddenPreference);
  const [movementOpen, setMovementOpen] = useState(false);

  const accounts = useMemo(
    () => accountsQuery.data ?? [],
    [accountsQuery.data],
  );

  const balances = useMemo(
    () => groupBalancesByCurrency(accounts),
    [accounts],
  );

  const accountNameById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );

  function toggleHidden() {
    setHidden((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(BALANCE_VISIBILITY_KEY, next ? "1" : "0");
      } catch {
        // La preferencia es opcional; la app sigue funcionando igual.
      }
      return next;
    });
  }

  const firstName = user?.name.split(" ")[0] ?? "";

  if (accountsQuery.isPending) {
    return <WalletSkeleton />;
  }

  if (accountsQuery.isError) {
    return (
      <div>
        <PageHeader title="Billetera personal" />
        <ErrorState
          className="mt-6"
          message={getErrorMessage(
            accountsQuery.error,
            "No pudimos cargar tus cuentas.",
          )}
          onRetry={() => accountsQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={firstName ? `Hola, ${firstName}` : "Billetera personal"}
        description="Este es el estado de tu dinero hoy. Los saldos se calculan con movimientos completados."
      />

      <div className="mt-6 space-y-6">
        <PendingTransfersBanner />

        <section
          className="guilloche relative overflow-hidden rounded-3xl bg-sidebar px-5 py-6 text-white sm:px-8 sm:py-7"
          aria-labelledby="wallet-balance-title"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="wallet-balance-title"
                  className="text-sm font-medium text-white/65"
                >
                  Saldo disponible
                </h2>
                <p className="mt-0.5 text-xs text-white/40">
                  Cada moneda se muestra por separado
                </p>
              </div>
              <button
                type="button"
                onClick={toggleHidden}
                aria-pressed={hidden}
                aria-label={
                  hidden ? "Mostrar saldos" : "Ocultar saldos"
                }
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {hidden ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
                {hidden ? "Mostrar" : "Ocultar"}
              </button>
            </div>

            {balances.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/65">
                Todavía no tenés cuentas asociadas.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {balances.map((balance) => (
                  <div
                    key={balance.currency}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-medium text-white/60">
                        {CURRENCY_NAMES[balance.currency]}
                      </p>
                      <span className="text-[11px] text-white/35">
                        {balance.accountCount === 1
                          ? "1 cuenta"
                          : `${balance.accountCount} cuentas`}
                      </span>
                    </div>
                    <p className="mt-1.5">
                      <Money
                        amount={balance.cents / 100}
                        currency={balance.currency}
                        size="hero"
                        hidden={hidden}
                        inverse
                      />
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link
                to="/transferir"
                className={buttonClasses({ variant: "accent" })}
              >
                <SendIcon className="size-4" />
                Transferir
              </Link>
              <Button
                variant="inverse"
                onClick={() => setMovementOpen(true)}
                disabled={accounts.length === 0}
              >
                <PlusIcon className="size-4" />
                Nuevo movimiento
              </Button>
              <span className="ml-auto hidden text-[11px] text-white/35 sm:block">
                Actualizado{" "}
                {accountsQuery.dataUpdatedAt
                  ? formatDateTime(
                      new Date(accountsQuery.dataUpdatedAt).toISOString(),
                    )
                  : "—"}
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section
            className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="recent-transactions-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="recent-transactions-title"
                  className="font-display text-lg font-semibold text-ink"
                >
                  Últimos movimientos
                </h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Los cinco más recientes de todas tus cuentas.
                </p>
              </div>
              <Link
                to="/historial"
                className="shrink-0 text-sm font-medium text-bill underline-offset-4 hover:underline"
              >
                Ver historial
              </Link>
            </div>

            <div className="mt-3">
              {recentQuery.isPending ? (
                <div className="space-y-3 py-2">
                  {[0, 1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-40 max-w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : recentQuery.isError ? (
                <ErrorState
                  title="No pudimos cargar los movimientos"
                  message={getErrorMessage(
                    recentQuery.error,
                    "Probá de nuevo en unos segundos.",
                  )}
                  onRetry={() => recentQuery.refetch()}
                />
              ) : (recentQuery.data?.transactions.length ?? 0) === 0 ? (
                <EmptyState
                  icon={<LedgerIcon />}
                  title="Todavía no hay movimientos"
                  message="Cuando registres un ingreso o gasto, va a aparecer acá."
                  action={
                    <Button
                      size="sm"
                      onClick={() => setMovementOpen(true)}
                      disabled={accounts.length === 0}
                    >
                      <PlusIcon className="size-4" />
                      Registrar el primero
                    </Button>
                  }
                />
              ) : (
                <ul className="divide-y divide-line/70">
                  {recentQuery.data?.transactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      accountName={accountNameById.get(transaction.accountId)}
                      accountNameById={accountNameById}
                    />
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section
            className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="accounts-title"
          >
            <h2
              id="accounts-title"
              className="font-display text-lg font-semibold text-ink"
            >
              Tus cuentas
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              El saldo de cada cuenta se calcula por separado.
            </p>

            <ul className="mt-4 space-y-2">
              {accounts.map((account) => (
                <li
                  key={account.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-paper/60 px-3.5 py-3"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface text-ink-soft">
                    <WalletIcon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {account.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      Saldo:{" "}
                      {hidden
                        ? "oculto"
                        : formatCents(toCents(account.balance), account.currency)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Money
                      amount={account.balance}
                      currency={account.currency}
                      size="sm"
                      hidden={hidden}
                    />
                    <CurrencyBadge currency={account.currency} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <SecurityNote>
                No sumamos monedas distintas ni hacemos conversiones
                implícitas. Un saldo en dólares no se mezcla con uno en pesos.
              </SecurityNote>
            </div>
          </section>
        </div>
      </div>

      <NewMovementDialog
        open={movementOpen}
        onClose={() => setMovementOpen(false)}
        accounts={accounts}
      />
    </div>
  );
}
