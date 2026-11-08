import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Account } from "../../domain/entities";
import { CATEGORY_OPTIONS, getCategoryLabel } from "../../domain/transactions/categories";
import {
  formatCents,
  parseAmount,
  toCents,
} from "../../domain/money/money";
import { isApiError } from "../../infrastructure/api/errors";
import { cn } from "../../shared/cn";
import { Button } from "../../ui/Button";
import { Field, Input, Select, Textarea } from "../../ui/form";
import { InlineNotice } from "../../ui/States";
import { Modal } from "../../ui/Modal";
import { useToast } from "../../ui/Toast";
import { Money } from "../../ui/Money";
import { useCategories } from "../categories/useCategories";
import { useCreateTransaction } from "./useCreateTransaction";

type MovementType = "income" | "expense";

interface MovementErrors {
  accountId?: string;
  amount?: string;
  description?: string;
  category?: string;
}

interface NewMovementDialogProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
}

export function NewMovementDialog({
  open,
  onClose,
  accounts,
}: NewMovementDialogProps) {
  const categoriesQuery = useCategories();
  const createTransaction = useCreateTransaction();
  const { pushToast } = useToast();

  const [type, setType] = useState<MovementType>("expense");
  const [accountId, setAccountId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<MovementErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const wasOpen = useRef(false);

  const categoryIds = useMemo(
    () => categoriesQuery.data ?? CATEGORY_OPTIONS.map((option) => option.id),
    [categoriesQuery.data],
  );

  const selectedAccount =
    accounts.find((account) => account.id === accountId) ?? null;

  useEffect(() => {
    if (open && !wasOpen.current) {
      setType("expense");
      setAccountId(accounts[0]?.id ?? "");
      setAmountInput("");
      setCategory("other");
      setDescription("");
      setErrors({});
      setApiError(null);
    }
    wasOpen.current = open;
  }, [open, accounts]);

  const parsedAmount = selectedAccount
    ? parseAmount(amountInput, selectedAccount.currency)
    : null;

  function updateAmount(value: string) {
    setAmountInput(value);
    setErrors((current) => ({ ...current, amount: undefined }));
    setApiError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: MovementErrors = {};

    if (!selectedAccount) {
      nextErrors.accountId = "Elegí una cuenta.";
    }

    if (!amountInput.trim()) {
      nextErrors.amount = "Ingresá un monto.";
    } else if (parsedAmount && !parsedAmount.ok) {
      nextErrors.amount = parsedAmount.message;
    }

    if (description.length > 500) {
      nextErrors.description = "La descripción no puede superar los 500 caracteres.";
    }

    if (
      !nextErrors.amount &&
      parsedAmount?.ok &&
      selectedAccount &&
      type === "expense" &&
      parsedAmount.value.cents > toCents(selectedAccount.balance)
    ) {
      nextErrors.amount = `El gasto supera el saldo disponible (${formatCents(toCents(selectedAccount.balance), selectedAccount.currency)}). Elegí otra cuenta o registrá un ingreso.`;
    }

    if (!categoryIds.includes(category)) {
      nextErrors.category = "Elegí una categoría válida.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setApiError(null);
      return;
    }

    if (!selectedAccount || !parsedAmount?.ok) return;

    try {
      await createTransaction.mutateAsync({
        accountId: selectedAccount.id,
        type,
        amount: parsedAmount.value.cents / 100,
        category,
        description: description.trim() || undefined,
      });
      pushToast(
        type === "income"
          ? "Ingreso registrado. El saldo ya está actualizado."
          : "Gasto registrado. El saldo ya está actualizado.",
      );
      onClose();
    } catch (error) {
      if (isApiError(error)) {
        setApiError(error.message);
        setErrors((current) => ({
          ...current,
          accountId: error.fieldErrors.accountId ?? current.accountId,
          amount: error.fieldErrors.amount ?? current.amount,
          description: error.fieldErrors.description ?? current.description,
          category: error.fieldErrors.category ?? current.category,
        }));
      } else {
        setApiError("No pudimos registrar el movimiento. Probá de nuevo.");
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo movimiento"
      description="Registrá un ingreso o gasto. El saldo se actualiza de inmediato."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createTransaction.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="new-movement-form"
            loading={createTransaction.isPending}
          >
            {createTransaction.isPending
              ? "Registrando…"
              : type === "income"
                ? "Registrar ingreso"
                : "Registrar gasto"}
          </Button>
        </>
      }
    >
      <form id="new-movement-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {apiError ? (
          <InlineNotice tone="danger">{apiError}</InlineNotice>
        ) : null}

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">
            Tipo de movimiento
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "expense", label: "Gasto", hint: "Sale de la cuenta" },
                { value: "income", label: "Ingreso", hint: "Entra a la cuenta" },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer rounded-xl border px-3 py-2.5 transition-colors",
                  type === option.value
                    ? "border-bill bg-bill-soft/60"
                    : "border-line-strong bg-surface hover:bg-paper-deep/60",
                )}
              >
                <input
                  type="radio"
                  name="movement-type"
                  value={option.value}
                  checked={type === option.value}
                  onChange={() => {
                    setType(option.value);
                    setApiError(null);
                  }}
                  className="sr-only"
                />
                <span className="block text-sm font-medium text-ink">
                  {option.label}
                </span>
                <span className="block text-xs text-ink-muted">{option.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Cuenta" htmlFor="movement-account" error={errors.accountId}>
          <Select
            id="movement-account"
            value={accountId}
            onChange={(event) => {
              setAccountId(event.target.value);
              setErrors((current) => ({ ...current, accountId: undefined }));
              setApiError(null);
            }}
            invalid={Boolean(errors.accountId)}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} · {account.currency} · saldo{" "}
                {formatCents(toCents(account.balance), account.currency)}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Monto"
          htmlFor="movement-amount"
          error={errors.amount}
          hint={
            selectedAccount
              ? `Saldo disponible: ${formatCents(toCents(selectedAccount.balance), selectedAccount.currency)}. Podés usar coma o punto para los decimales.`
              : undefined
          }
        >
          <div className="relative">
            <Input
              id="movement-amount"
              name="amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0,00"
              value={amountInput}
              onChange={(event) => updateAmount(event.target.value)}
              invalid={Boolean(errors.amount)}
              className="pr-16 tabular-nums"
              aria-describedby={
                errors.amount ? "movement-amount-error" : "movement-amount-hint"
              }
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-ink-muted">
              {selectedAccount?.currency ?? "ARS"}
            </span>
          </div>
          {parsedAmount?.ok ? (
            <p className="text-xs text-ink-soft">
              Se registra como{" "}
              <Money
                amount={parsedAmount.value.cents / 100}
                currency={parsedAmount.value.currency}
                size="sm"
              />
            </p>
          ) : null}
        </Field>

        <Field label="Categoría" htmlFor="movement-category" error={errors.category}>
          <Select
            id="movement-category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setErrors((current) => ({ ...current, category: undefined }));
            }}
            invalid={Boolean(errors.category)}
          >
            {categoryIds.map((id) => (
              <option key={id} value={id}>
                {getCategoryLabel(id)}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Descripción"
          htmlFor="movement-description"
          error={errors.description}
          optional
          hint={`${description.length}/500 caracteres`}
        >
          <Textarea
            id="movement-description"
            name="description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setErrors((current) => ({ ...current, description: undefined }));
            }}
            maxLength={500}
            placeholder="Ej.: Supermercado del barrio"
            invalid={Boolean(errors.description)}
          />
        </Field>
      </form>
    </Modal>
  );
}
