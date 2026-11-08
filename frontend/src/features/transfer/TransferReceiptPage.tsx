import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { Transfer } from "../../domain/entities";
import { findContact } from "../../domain/contacts/contacts";
import { formatDateTime } from "../../domain/format";
import { isTerminalStatus } from "../../domain/transfers/transfer";
import { getErrorMessage } from "../../shared/errorMessage";
import { useDocumentTitle } from "../../shared/useDocumentTitle";
import { cn } from "../../shared/cn";
import { Button, buttonClasses } from "../../ui/Button";
import { CurrencyBadge, Money } from "../../ui/Money";
import { PageHeader } from "../../ui/PageHeader";
import {
  EmptyState,
  ErrorState,
  InlineNotice,
  SecurityNote,
  Skeleton,
} from "../../ui/States";
import { TransferStamp } from "../../ui/StatusBadge";
import { useToast } from "../../ui/Toast";
import {
  ChevronLeftIcon,
  CopyIcon,
  LedgerIcon,
  RefreshIcon,
  SendIcon,
  WalletIcon,
} from "../../ui/icons";
import { isApiError } from "../../infrastructure/api/errors";
import { useAccounts } from "../accounts/useAccounts";
import { useTransferStatus } from "./useTransfers";

function ReceiptSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-72" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

function useSettledInvalidation(transfer: Transfer | undefined) {
  const queryClient = useQueryClient();
  const handledStatus = useRef<string | null>(null);

  useEffect(() => {
    if (!transfer) return;
    if (!isTerminalStatus(transfer.status)) return;
    if (handledStatus.current === transfer.status) return;

    handledStatus.current = transfer.status;
    void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }, [transfer, queryClient]);
}

export function TransferReceiptPage() {
  useDocumentTitle("Comprobante de transferencia");
  const { transferId = "" } = useParams<{ transferId: string }>();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const transferQuery = useTransferStatus(transferId);
  const accountsQuery = useAccounts();
  const [copied, setCopied] = useState(false);

  const transfer = transferQuery.data;
  useSettledInvalidation(transfer);

  const accountNameById = useMemo(
    () =>
      new Map(
        (accountsQuery.data ?? []).map((account) => [account.id, account.name]),
      ),
    [accountsQuery.data],
  );

  const ownTransaction = transfer?.from ?? transfer?.to ?? null;
  const isIncoming = Boolean(transfer?.to && !transfer?.from);
  const counterpart = ownTransaction
    ? findContact(ownTransaction.counterpartAccountId)
    : null;

  const counterpartName =
    counterpart?.ownerName ??
    (isIncoming ? "Otra cuenta" : "Cuenta externa");

  const ownAccountName = ownTransaction
    ? (accountNameById.get(ownTransaction.accountId) ?? "Tu cuenta")
    : "Tu cuenta";

  async function copyId() {
    if (!transferId) return;

    try {
      await navigator.clipboard.writeText(transferId);
      setCopied(true);
      pushToast("Copiamos el ID de la transferencia.", "success");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      pushToast("No pudimos copiar el ID. Seleccionalo manualmente.", "error");
    }
  }

  if (!transferId) {
    return (
      <div>
        <PageHeader title="Comprobante de transferencia" />
        <EmptyState
          className="mt-6"
          icon={<SendIcon />}
          title="No hay una transferencia para mostrar"
          message="Volvé a la billetera y elegí una operación para ver su estado."
          action={
            <Link
              to="/billetera"
              className={buttonClasses({ variant: "primary", size: "sm" })}
            >
              <WalletIcon className="size-4" />
              Ir a la billetera
            </Link>
          }
        />
      </div>
    );
  }

  if (transferQuery.isPending) {
    return <ReceiptSkeleton />;
  }

  if (transferQuery.isError) {
    const status = isApiError(transferQuery.error)
      ? transferQuery.error.status
      : 0;
    const notFound = status === 404;

    return (
      <div>
        <PageHeader
          title="Comprobante de transferencia"
          description={`ID ${transferId}`}
        />
        <ErrorState
          className="mt-6"
          title={
            notFound
              ? "No encontramos esa transferencia"
              : "No pudimos consultar la transferencia"
          }
          message={
            notFound
              ? "Puede que la operación no exista o que no pertenezca a tu usuario."
              : getErrorMessage(
                  transferQuery.error,
                  "Probá de nuevo en unos segundos.",
                )
          }
          onRetry={() => transferQuery.refetch()}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/historial"
            className={buttonClasses({ variant: "secondary" })}
          >
            <LedgerIcon className="size-4" />
            Ver historial
          </Link>
          <Link to="/transferir" className={buttonClasses({ variant: "ghost" })}>
            <SendIcon className="size-4" />
            Transferir
          </Link>
        </div>
      </div>
    );
  }

  const status = transfer?.status ?? "pending";
  const isPending = status === "pending";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeftIcon className="size-4" />
        Volver
      </button>

      <PageHeader
        title="Comprobante de transferencia"
        description={
          isIncoming
            ? "Esta es la transferencia que recibiste."
            : "Este es el estado de la transferencia que enviaste."
        }
        actions={
          isPending ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e2cb93] bg-pending-soft/60 px-3 py-1.5 text-xs font-medium text-[#7d5708]">
              <span className="size-1.5 rounded-full bg-current animate-pending-pulse" />
              Actualizando cada segundo
            </span>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => transferQuery.refetch()}
              disabled={transferQuery.isFetching}
            >
              <RefreshIcon className="size-4" />
              Actualizar
            </Button>
          )
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section
          className={cn(
            "overflow-hidden rounded-3xl border bg-surface",
            isPending && "border-[#e2cb93]",
            isCompleted && "border-line",
            isFailed && "border-danger/30",
          )}
          aria-labelledby="receipt-summary-title"
        >
          <div
            className={cn(
              "relative px-5 py-7 text-center sm:px-8 sm:py-9",
              isPending && "bg-pending-soft/40",
              isCompleted && "bg-bill-soft/40",
              isFailed && "bg-danger-soft/40",
            )}
          >
            <div className="flex justify-center">
              <TransferStamp status={status} />
            </div>

            <h2
              id="receipt-summary-title"
              className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-ink-muted"
            >
              {isIncoming ? "Monto recibido" : "Monto enviado"}
            </h2>

            {ownTransaction ? (
              <p className="mt-2 flex justify-center">
                <Money
                  amount={ownTransaction.amount}
                  currency={ownTransaction.currency}
                  sign={isIncoming ? "+" : "-"}
                  tone={isPending ? "pending" : isFailed ? "muted" : "default"}
                  size="display"
                />
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">
                La API no devolvió el detalle del monto.
              </p>
            )}

            <p className="mt-2 text-sm text-ink-soft">
              {isIncoming ? (
                <>
                  desde <span className="font-medium">{counterpartName}</span> a{" "}
                  <span className="font-medium">{ownAccountName}</span>
                </>
              ) : (
                <>
                  desde <span className="font-medium">{ownAccountName}</span> a{" "}
                  <span className="font-medium">{counterpartName}</span>
                </>
              )}
            </p>

            {isPending ? (
              <p className="mx-auto mt-4 max-w-sm text-xs leading-5 text-[#6f4d07]">
                La operación está en curso. El saldo se actualiza recién cuando
                se completa; no cierres esta pantalla si querés ver el cambio.
              </p>
            ) : isCompleted ? (
              <p className="mx-auto mt-4 max-w-sm text-xs leading-5 text-bill-deep">
                La transferencia se completó y los saldos ya están actualizados.
              </p>
            ) : (
              <p className="mx-auto mt-4 max-w-sm text-xs leading-5 text-danger">
                La transferencia falló. El dinero no se movió de tu cuenta.
              </p>
            )}
          </div>

          <div className="border-t border-line px-5 py-5 sm:px-8 sm:py-6">
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-muted">Cuenta de origen</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {isIncoming ? counterpartName : ownAccountName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Cuenta de destino</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {isIncoming ? ownAccountName : counterpartName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Moneda</dt>
                <dd className="mt-0.5">
                  {ownTransaction ? (
                    <CurrencyBadge currency={ownTransaction.currency} />
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Estado</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {isPending
                    ? "En curso"
                    : isCompleted
                      ? "Completada"
                      : "Fallida"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Fecha</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {ownTransaction
                    ? formatDateTime(ownTransaction.createdAt)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Descripción</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {ownTransaction?.description?.trim() || "Sin descripción"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-muted">ID de la transferencia</dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                  <code className="rounded-md border border-line bg-paper px-2 py-1 font-mono text-xs text-ink-soft">
                    {transferId}
                  </code>
                  <button
                    type="button"
                    onClick={copyId}
                    className="inline-flex items-center gap-1 text-xs font-medium text-bill underline-offset-4 hover:underline"
                  >
                    <CopyIcon className="size-3.5" />
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-display text-base font-semibold text-ink">
              ¿Qué sigue?
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              {isPending
                ? "Podés seguir usando la billetera. La operación se liquida sola en unos segundos."
                : isCompleted
                  ? "Ya podés ver el movimiento reflejado en tu historial y en el saldo de la cuenta."
                  : "Revisá el saldo de origen y volvé a intentar la transferencia."}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/billetera"
                className={buttonClasses({
                  variant: "primary",
                  fullWidth: true,
                })}
              >
                <WalletIcon className="size-4" />
                Ir a la billetera
              </Link>
              <Link
                to="/historial"
                className={buttonClasses({
                  variant: "secondary",
                  fullWidth: true,
                })}
              >
                <LedgerIcon className="size-4" />
                Ver historial
              </Link>
              <Link
                to="/transferir"
                className={buttonClasses({ variant: "ghost", fullWidth: true })}
              >
                <SendIcon className="size-4" />
                Hacer otra transferencia
              </Link>
            </div>
          </section>

          {isFailed ? (
            <InlineNotice tone="danger">
              Si el problema se repite, verificá que la cuenta de origen tenga
              saldo suficiente y que la cuenta de destino siga disponible.
            </InlineNotice>
          ) : null}

          <SecurityNote>
            Guardá este ID si necesitás hacer un reclamo. No compartas tus
            credenciales con nadie: Cauce nunca te las va a pedir.
          </SecurityNote>
        </aside>
      </div>

      {isPending ? (
        <p className="mt-6 text-center text-xs text-ink-muted" aria-live="polite">
          Consultando el estado de la transferencia…
        </p>
      ) : null}
    </div>
  );
}
