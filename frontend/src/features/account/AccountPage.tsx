import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  CURRENCY_NAMES,
  groupBalancesByCurrency,
} from "../../domain/money/balances";
import { formatDateTime } from "../../domain/format";
import { getErrorMessage } from "../../shared/errorMessage";
import { useDocumentTitle } from "../../shared/useDocumentTitle";
import { Avatar } from "../../ui/Avatar";
import { Button, buttonClasses } from "../../ui/Button";
import { CurrencyBadge, Money } from "../../ui/Money";
import { PageHeader } from "../../ui/PageHeader";
import {
  ErrorState,
  SecurityNote,
  Skeleton,
} from "../../ui/States";
import { useToast } from "../../ui/Toast";
import {
  CopyIcon,
  LedgerIcon,
  LogOutIcon,
  ShieldIcon,
  WalletIcon,
} from "../../ui/icons";
import { useAuth } from "../auth/AuthProvider";
import { useAccounts } from "../accounts/useAccounts";

function DataRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-line/70 py-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-xs font-medium text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-ink sm:text-right">
        {children}
      </dd>
    </div>
  );
}

export function AccountPage() {
  useDocumentTitle("Mi cuenta");
  const { user, session, logout } = useAuth();
  const accountsQuery = useAccounts();
  const { pushToast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const accounts = useMemo(
    () => accountsQuery.data ?? [],
    [accountsQuery.data],
  );
  const balances = useMemo(
    () => groupBalancesByCurrency(accounts),
    [accounts],
  );

  async function copyValue(field: string, value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      pushToast(`Copiamos ${label}.`, "success");
      window.setTimeout(() => setCopiedField(null), 2500);
    } catch {
      pushToast("No pudimos copiar el dato. Seleccionalo manualmente.", "error");
    }
  }

  if (!user) {
    return (
      <div>
        <PageHeader title="Mi cuenta" />
        <ErrorState
          className="mt-6"
          title="No encontramos tu sesión"
          message="Volvé a ingresar para ver los datos de tu cuenta."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Mi cuenta"
        description="Tus datos personales, las cuentas asociadas y la información de la sesión actual."
        actions={
          <Button variant="secondary" onClick={logout}>
            <LogOutIcon className="size-4" />
            Cerrar sesión
          </Button>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-6">
          <section
            className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="profile-title"
          >
            <div className="flex items-center gap-4">
              <Avatar name={user.name} size="lg" />
              <div className="min-w-0">
                <h2
                  id="profile-title"
                  className="truncate font-display text-xl font-semibold text-ink"
                >
                  {user.name}
                </h2>
                <p className="truncate text-sm text-ink-muted">{user.email}</p>
              </div>
            </div>

            <dl className="mt-5">
              <DataRow label="Nombre">
                <span className="break-words">{user.name}</span>
              </DataRow>
              <DataRow label="Email">
                <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="break-all">{user.email}</span>
                  <button
                    type="button"
                    onClick={() => copyValue("email", user.email, "el email")}
                    className="inline-flex items-center gap-1 text-xs font-medium text-bill underline-offset-4 hover:underline"
                  >
                    <CopyIcon className="size-3.5" />
                    {copiedField === "email" ? "Copiado" : "Copiar"}
                  </button>
                </span>
              </DataRow>
              <DataRow label="ID de usuario">
                <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <code className="rounded-md border border-line bg-paper px-2 py-0.5 font-mono text-xs text-ink-soft">
                    {user.id}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyValue("userId", user.id, "el ID")}
                    className="inline-flex items-center gap-1 text-xs font-medium text-bill underline-offset-4 hover:underline"
                  >
                    <CopyIcon className="size-3.5" />
                    {copiedField === "userId" ? "Copiado" : "Copiar"}
                  </button>
                </span>
              </DataRow>
              <DataRow label="Sesión iniciada">
                {session ? formatDateTime(session.loggedInAt) : "—"}
              </DataRow>
            </dl>
          </section>

          <section
            className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="account-accounts-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="account-accounts-title"
                  className="font-display text-lg font-semibold text-ink"
                >
                  Cuentas asociadas
                </h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Cada cuenta pertenece a una sola moneda.
                </p>
              </div>
              <Link
                to="/historial"
                className="shrink-0 text-sm font-medium text-bill underline-offset-4 hover:underline"
              >
                Ver historial
              </Link>
            </div>

            {accountsQuery.isPending ? (
              <div className="mt-4 space-y-2">
                {[0, 1].map((item) => (
                  <Skeleton key={item} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : accountsQuery.isError ? (
              <ErrorState
                className="mt-4"
                title="No pudimos cargar tus cuentas"
                message={getErrorMessage(
                  accountsQuery.error,
                  "Probá de nuevo en unos segundos.",
                )}
                onRetry={() => accountsQuery.refetch()}
              />
            ) : accounts.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line-strong px-4 py-6 text-sm text-ink-muted">
                No tenés cuentas asociadas a este usuario.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {accounts.map((account) => (
                  <li
                    key={account.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper/60 px-3.5 py-3"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface text-ink-soft">
                      <WalletIcon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {account.name}
                      </p>
                      <p className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                        <span className="font-mono">{account.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>{CURRENCY_NAMES[account.currency]}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Money
                        amount={account.balance}
                        currency={account.currency}
                        size="sm"
                      />
                      <CurrencyBadge currency={account.currency} />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {balances.length > 0 ? (
              <div className="mt-4 rounded-xl border border-line bg-paper-deep/40 px-4 py-3">
                <p className="text-xs font-medium text-ink-muted">
                  Total por moneda
                </p>
                <ul className="mt-2 space-y-1.5">
                  {balances.map((balance) => (
                    <li
                      key={balance.currency}
                      className="flex items-baseline justify-between gap-4 text-sm"
                    >
                      <span className="text-ink-soft">
                        {CURRENCY_NAMES[balance.currency]}
                      </span>
                      <Money
                        amount={balance.cents / 100}
                        currency={balance.currency}
                        size="sm"
                      />
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] leading-5 text-ink-muted">
                  No sumamos monedas distintas: cada moneda se muestra por
                  separado.
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-ink">
              <ShieldIcon className="size-5 text-bill" />
              <h2 className="font-display text-base font-semibold">
                Seguridad de la sesión
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Cauce guarda el token y tus datos básicos en el almacenamiento
              local del navegador para que no tengas que ingresar en cada
              recarga. Es una decisión de esta demo, no un patrón para
              producción.
            </p>

            <div className="mt-4">
              <SecurityNote>
                Si compartís el dispositivo, cerrá sesión al terminar. El token
                de la demo no expira y no hay refresh tokens.
              </SecurityNote>
            </div>

            <Button
              variant="danger"
              fullWidth
              className="mt-4"
              onClick={logout}
            >
              <LogOutIcon className="size-4" />
              Cerrar sesión en este dispositivo
            </Button>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-display text-base font-semibold text-ink">
              Atajos
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                to="/billetera"
                className={buttonClasses({
                  variant: "secondary",
                  fullWidth: true,
                })}
              >
                <WalletIcon className="size-4" />
                Ir a la billetera
              </Link>
              <Link
                to="/historial"
                className={buttonClasses({
                  variant: "ghost",
                  fullWidth: true,
                })}
              >
                <LedgerIcon className="size-4" />
                Ver historial
              </Link>
            </div>
          </section>

          <p className="px-1 text-[11px] leading-5 text-ink-muted">
            Cauce · Demo fintech 2026. Los datos provienen del mock API y del
            almacenamiento local de tu navegador.
          </p>
        </aside>
      </div>
    </div>
  );
}
