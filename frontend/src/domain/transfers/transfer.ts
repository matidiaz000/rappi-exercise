import type { Currency, TransactionStatus } from "../entities";
import { formatCents } from "../money/money";

export interface TransferAccount {
  id: string;
  name: string;
  currency: Currency;
}

export interface TransferSourceAccount extends TransferAccount {
  balanceCents: number;
}

export type TransferBlockCode =
  | "missing-source"
  | "missing-destination"
  | "same-account"
  | "invalid-amount"
  | "currency-mismatch"
  | "insufficient-funds";

export type TransferCheck =
  | { ok: true }
  | { ok: false; code: TransferBlockCode; message: string };

export interface EvaluateTransferInput {
  /** null cuando el monto todavía no es parseable. */
  amountCents: number | null;
  source: TransferSourceAccount | null;
  destination: TransferAccount | null;
}

export function evaluateTransfer({
  amountCents,
  source,
  destination,
}: EvaluateTransferInput): TransferCheck {
  if (!source) {
    return {
      ok: false,
      code: "missing-source",
      message: "Elegí una cuenta de origen.",
    };
  }

  if (!destination) {
    return {
      ok: false,
      code: "missing-destination",
      message: "Elegí a quién querés transferirle.",
    };
  }

  if (source.id === destination.id) {
    return {
      ok: false,
      code: "same-account",
      message: "La cuenta de origen y destino no pueden ser la misma.",
    };
  }

  if (amountCents === null || !Number.isInteger(amountCents) || amountCents <= 0) {
    return {
      ok: false,
      code: "invalid-amount",
      message: "Ingresá un monto mayor a cero.",
    };
  }

  if (source.currency !== destination.currency) {
    return {
      ok: false,
      code: "currency-mismatch",
      message: `La cuenta destino está en ${destination.currency} y la de origen en ${source.currency}. La API no hace conversión: el mismo monto quedaría registrado en ambas monedas. Elegí una cuenta de la misma moneda.`,
    };
  }

  if (amountCents > source.balanceCents) {
    return {
      ok: false,
      code: "insufficient-funds",
      message: `El saldo disponible es ${formatCents(source.balanceCents, source.currency)} y querés transferir ${formatCents(amountCents, source.currency)}.`,
    };
  }

  return { ok: true };
}

export function isTerminalStatus(status: TransactionStatus): boolean {
  return status === "completed" || status === "failed";
}

export function isTransferPending(status: TransactionStatus): boolean {
  return status === "pending";
}

export function shouldPollTransfer(status: TransactionStatus | undefined): boolean {
  return status === "pending";
}

export function transferStatusLabel(status: TransactionStatus): string {
  switch (status) {
    case "pending":
      return "En curso";
    case "completed":
      return "Completada";
    case "failed":
      return "Fallida";
  }
}
