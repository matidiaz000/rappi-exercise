import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  contactsForUser,
  filterContacts,
  findContact,
  groupContacts,
  getInitials,
} from "../../domain/contacts/contacts";
import { formatAmount, moneyFromCents, parseAmount, toCents } from "../../domain/money/money";
import {
  evaluateTransfer,
  type TransferAccount,
  type TransferSourceAccount,
} from "../../domain/transfers/transfer";
import { getErrorMessage } from "../../shared/errorMessage";
import { useDocumentTitle } from "../../shared/useDocumentTitle";
import { cn } from "../../shared/cn";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { CurrencyBadge, Money } from "../../ui/Money";
import { Field, Input, Select, Textarea } from "../../ui/form";
import { PageHeader } from "../../ui/PageHeader";
import { EmptyState, ErrorState, InlineNotice, Skeleton } from "../../ui/States";
import { Modal } from "../../ui/Modal";
import { SearchIcon, SendIcon } from "../../ui/icons";
import { isApiError } from "../../infrastructure/api/errors";
import { useAuth } from "../auth/AuthProvider";
import { useAccounts } from "../accounts/useAccounts";
import { useCreateTransfer } from "./useTransfers";

function TransferSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-52" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}

export function TransferPage() {
  useDocumentTitle("Transferir");
  const { user } = useAuth();
  const navigate = useNavigate();
  const accountsQuery = useAccounts();
  const createTransfer = useCreateTransfer();
  const formRef = useRef<HTMLElement>(null);

  const accounts = useMemo(
    () => accountsQuery.data ?? [],
    [accountsQuery.data],
  );
  const contacts = useMemo(
    () => (user ? contactsForUser(user.id) : []),
    [user],
  );
  const availableCurrencies = useMemo(
    () => new Set(accounts.map((account) => account.currency)),
    [accounts],
  );

  const [contactSearch, setContactSearch] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [description, setDescription] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sourceAccount =
    accounts.find((account) => account.id === sourceAccountId) ??
    accounts[0] ??
    null;
  const destinationContact = findContact(destinationId);
  const filteredContacts = filterContacts(contacts, contactSearch);
  const groups = groupContacts(filteredContacts);

  const source: TransferSourceAccount | null = sourceAccount
    ? {
        id: sourceAccount.id,
        name: sourceAccount.name,
        currency: sourceAccount.currency,
        balanceCents: toCents(sourceAccount.balance),
      }
    : null;

  const destination: TransferAccount | null = destinationContact
    ? {
        id: destinationContact.accountId,
        name: destinationContact.accountName,
        currency: destinationContact.currency,
      }
    : null;

  const parsedAmount = source ? parseAmount(amountInput, source.currency) : null;
  const amountCents = parsedAmount?.ok ? parsedAmount.value.cents : null;

  const check = evaluateTransfer({
    amountCents,
    source,
    destination,
  });

  const amountParseError =
    amountInput.trim() && parsedAmount && !parsedAmount.ok
      ? parsedAmount.message
      : null;

  const shouldShowCheck =
    !check.ok &&
    (showValidation ||
      amountParseError !== null ||
      check.code === "currency-mismatch" ||
      (check.code === "insufficient-funds" && amountInput.trim() !== ""));

  const visibleMessage = amountParseError ?? (shouldShowCheck ? check.message : null);

  function selectDestination(accountId: string) {
    const contact = findContact(accountId);
    setDestinationId(accountId);
    setSubmitError(null);
    setShowValidation(false);

    if (!contact) return;

    const currentSource = sourceAccount;
    if (!currentSource || currentSource.currency !== contact.currency) {
      const matching = accounts.find(
        (account) => account.currency === contact.currency,
      );
      if (matching) setSourceAccountId(matching.id);
    }

    if (window.matchMedia("(max-width: 1023px)").matches) {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  }

  function useMaximum() {
    if (!source) return;
    setAmountInput(
      formatAmount(moneyFromCents(source.balanceCents, source.currency)),
    );
  }

  function handleReview() {
    setShowValidation(true);
    setSubmitError(null);
    if (check.ok) setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!check.ok || !source || !destinationContact || !parsedAmount?.ok) {
      return;
    }

    setSubmitError(null);

    try {
      const transfer = await createTransfer.mutateAsync({
        fromAccountId: source.id,
        toAccountId: destinationContact.accountId,
        amount: parsedAmount.value.cents / 100,
        description: description.trim() || undefined,
      });

      setConfirmOpen(false);
      navigate(`/transferir/${transfer.id}`, {
        state: {
          destination: destinationContact,
          sourceAccountName: source.name,
        },
      });
    } catch (error) {
      if (isApiError(error)) {
        setSubmitError(error.message);
        if (error.status === 422) {
          await accountsQuery.refetch();
        }
      } else {
        setSubmitError("No pudimos crear la transferencia. Probá de nuevo.");
      }
    }
  }

  if (accountsQuery.isPending) {
    return <TransferSkeleton />;
  }

  if (accountsQuery.isError) {
    return (
      <div>
        <PageHeader title="Transferir" />
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
        title="Transferir"
        description="Elegí a quién y desde qué cuenta. Antes de enviar vas a ver un resumen para confirmar."
        actions={
          <Link
            to="/historial"
            className="text-sm font-medium text-bill underline-offset-4 hover:underline"
          >
            Ver transferencias
          </Link>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start">
        <section aria-labelledby="transfer-destination-title">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-full bg-ink text-xs font-semibold text-white">
              1
            </span>
            <h2
              id="transfer-destination-title"
              className="font-display text-lg font-semibold"
            >
              Elegí un destino
            </h2>
          </div>

          <div className="mt-3">
            <label htmlFor="contact-search" className="sr-only">
              Buscar contacto
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="contact-search"
                type="search"
                placeholder="Buscar por nombre, cuenta o moneda…"
                value={contactSearch}
                onChange={(event) => setContactSearch(event.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {groups.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={<SearchIcon />}
              title="No encontramos contactos"
              message="Probá con otro nombre o limpiá la búsqueda."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setContactSearch("")}
                >
                  Limpiar búsqueda
                </Button>
              }
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {groups.map((group) => (
                <li
                  key={group.userId}
                  className="rounded-2xl border border-line bg-surface p-4"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={group.ownerName} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {group.ownerName}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {group.accounts.length === 1
                          ? "1 cuenta asociada"
                          : `${group.accounts.length} cuentas asociadas`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {group.accounts.map((contact) => {
                      const selected = destinationId === contact.accountId;
                      const disabled = !availableCurrencies.has(contact.currency);

                      return (
                        <div key={contact.accountId}>
                          <button
                            type="button"
                            onClick={() => selectDestination(contact.accountId)}
                            disabled={disabled}
                            aria-pressed={selected}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                              selected
                                ? "border-bill bg-bill-soft/50"
                                : "border-line bg-paper/50 hover:border-line-strong hover:bg-paper",
                              disabled &&
                                "cursor-not-allowed opacity-55 hover:border-line hover:bg-paper/50",
                            )}
                          >
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-[11px] font-semibold text-ink-soft">
                              {getInitials(group.ownerName)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-ink">
                                {contact.accountName}
                              </p>
                              <p className="text-xs text-ink-muted">
                                {contact.currency}
                                {disabled
                                  ? " · no tenés una cuenta en esta moneda"
                                  : " · transferencia P2P"}
                              </p>
                            </div>
                            <CurrencyBadge currency={contact.currency} />
                            <span
                              className={cn(
                                "grid size-5 place-items-center rounded-full border",
                                selected
                                  ? "border-bill bg-bill"
                                  : "border-line-strong bg-surface",
                              )}
                              aria-hidden="true"
                            >
                              {selected ? (
                                <span className="size-2 rounded-full bg-white" />
                              ) : null}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <InlineNotice tone="info" className="mt-4">
            El directorio es de demostración: la API no expone usuarios, así que
            estas cuentas provienen del seed. Una cuenta de otra moneda queda
            deshabilitada porque la API no convierte.
          </InlineNotice>
        </section>

        <section
          ref={formRef}
          aria-labelledby="transfer-form-title"
          className="rounded-2xl border border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-6"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-full bg-ink text-xs font-semibold text-white">
              2
            </span>
            <h2
              id="transfer-form-title"
              className="font-display text-lg font-semibold"
            >
              Completá la transferencia
            </h2>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-paper/60 p-3.5">
            {destinationContact ? (
              <div className="flex items-center gap-3">
                <Avatar name={destinationContact.ownerName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {destinationContact.ownerName}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {destinationContact.accountName}
                  </p>
                </div>
                <CurrencyBadge currency={destinationContact.currency} />
              </div>
            ) : (
              <p className="text-sm text-ink-muted">
                Todavía no elegiste un destino.
              </p>
            )}
          </div>

          <div className="mt-4 space-y-4">
            <Field label="Desde" htmlFor="transfer-source">
              <Select
                id="transfer-source"
                value={sourceAccount?.id ?? ""}
                onChange={(event) => {
                  setSourceAccountId(event.target.value);
                  setSubmitError(null);
                }}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} · {account.currency}
                  </option>
                ))}
              </Select>
              {source ? (
                <p className="text-xs text-ink-muted">
                  Disponible:{" "}
                  <Money
                    amount={source.balanceCents / 100}
                    currency={source.currency}
                    size="sm"
                  />
                </p>
              ) : null}
            </Field>

            <Field
              label="Monto"
              htmlFor="transfer-amount"
              hint="Usá coma o punto para los decimales."
            >
              <div className="relative">
                <Input
                  id="transfer-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0,00"
                  value={amountInput}
                  onChange={(event) => {
                    setAmountInput(event.target.value);
                    setSubmitError(null);
                  }}
                  invalid={Boolean(amountParseError)}
                  className="pr-24 tabular-nums"
                />
                <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                  <span className="text-xs font-semibold text-ink-muted">
                    {source?.currency ?? "ARS"}
                  </span>
                  <button
                    type="button"
                    onClick={useMaximum}
                    disabled={!source || source.balanceCents <= 0}
                    className="rounded-md px-1.5 py-1 text-[11px] font-medium text-bill hover:bg-bill-soft disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:bg-transparent"
                  >
                    Máximo
                  </button>
                </div>
              </div>
              {parsedAmount?.ok ? (
                <p className="text-xs text-ink-soft">
                  Vas a transferir{" "}
                  <Money
                    amount={parsedAmount.value.cents / 100}
                    currency={parsedAmount.value.currency}
                    size="sm"
                  />
                </p>
              ) : null}
            </Field>

            <Field
              label="Descripción"
              htmlFor="transfer-description"
              optional
              hint={`${description.length}/500 caracteres`}
            >
              <Textarea
                id="transfer-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                placeholder="Ej.: Pago del alquiler"
              />
            </Field>

            {visibleMessage ? (
              <InlineNotice
                tone={
                  check.ok === false && check.code === "insufficient-funds"
                    ? "warning"
                    : "danger"
                }
              >
                {visibleMessage}
              </InlineNotice>
            ) : null}

            {submitError ? (
              <InlineNotice tone="danger">{submitError}</InlineNotice>
            ) : null}

            <Button
              fullWidth
              size="lg"
              onClick={handleReview}
              disabled={!check.ok || createTransfer.isPending}
            >
              <SendIcon className="size-4" />
              Revisar transferencia
            </Button>

            <p className="text-center text-xs leading-5 text-ink-muted">
              Al confirmar, la transferencia queda <strong>en curso</strong> y
              se completa en unos segundos. El saldo se descuenta al completarse.
            </p>
          </div>
        </section>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!createTransfer.isPending) {
            setConfirmOpen(false);
            setSubmitError(null);
          }
        }}
        title="Confirmá la transferencia"
        description="Revisá los datos antes de enviar. Esta acción mueve dinero."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={createTransfer.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              loading={createTransfer.isPending}
              disabled={!check.ok}
            >
              {createTransfer.isPending
                ? "Enviando…"
                : "Confirmar transferencia"}
            </Button>
          </>
        }
      >
        {source && destinationContact && parsedAmount?.ok ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-paper/60 px-4 py-5 text-center">
              <p className="text-xs font-medium text-ink-muted">
                Vas a transferir
              </p>
              <p className="mt-1">
                <Money
                  amount={parsedAmount.value.cents / 100}
                  currency={source.currency}
                  size="display"
                />
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                desde {source.name} a {destinationContact.ownerName}
              </p>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-muted">Cuenta destino</dt>
                <dd className="text-right font-medium text-ink">
                  {destinationContact.accountName} ({destinationContact.currency})
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-muted">Saldo después de enviar</dt>
                <dd className="text-right font-medium text-ink">
                  <Money
                    amount={
                      (source.balanceCents - parsedAmount.value.cents) / 100
                    }
                    currency={source.currency}
                    size="sm"
                  />
                </dd>
              </div>
              {description.trim() ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-muted">Descripción</dt>
                  <dd className="max-w-[60%] text-right font-medium text-ink">
                    {description.trim()}
                  </dd>
                </div>
              ) : null}
            </dl>

            <InlineNotice tone="info">
              La API registra la transferencia como <strong>en curso</strong> y
              la completa alrededor de 1,5 segundos después. Te vamos a mostrar
              el cambio de estado en el comprobante.
            </InlineNotice>

            {submitError ? (
              <InlineNotice tone="danger">{submitError}</InlineNotice>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
