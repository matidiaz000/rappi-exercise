import type { Transaction, TransactionStatus, TransferDirection } from "../entities";
import { getCategoryLabel } from "./categories";

export type TransactionTone = "positive" | "negative" | "pending";

export interface TransactionView {
  title: string;
  categoryLabel: string;
  direction: TransferDirection;
  tone: TransactionTone;
  sign: "+" | "-";
  statusLabel: string;
  isTransfer: boolean;
  isPending: boolean;
}

export function getTransactionDirection(
  transaction: Transaction,
): TransferDirection {
  if (transaction.type === "income") return "in";
  if (transaction.type === "expense") return "out";
  return transaction.direction ?? "out";
}

export function getStatusLabel(status: TransactionStatus): string {
  switch (status) {
    case "pending":
      return "En curso";
    case "completed":
      return "Completado";
    case "failed":
      return "Fallido";
  }
}

export function describeTransaction(transaction: Transaction): TransactionView {
  const direction = getTransactionDirection(transaction);
  const categoryLabel = getCategoryLabel(transaction.category);
  const description = transaction.description?.trim();

  const fallbackTitle =
    transaction.type === "transfer"
      ? direction === "in"
        ? "Transferencia recibida"
        : "Transferencia enviada"
      : categoryLabel;

  const tone: TransactionTone =
    transaction.status === "pending"
      ? "pending"
      : direction === "in"
        ? "positive"
        : "negative";

  return {
    title: description || fallbackTitle,
    categoryLabel,
    direction,
    tone,
    sign: direction === "in" ? "+" : "-",
    statusLabel: getStatusLabel(transaction.status),
    isTransfer: transaction.type === "transfer",
    isPending: transaction.status === "pending",
  };
}

export function getCounterpartLabel(
  transaction: Transaction,
  accountNameById: ReadonlyMap<string, string>,
): string | null {
  if (transaction.type !== "transfer") return null;
  if (!transaction.counterpartAccountId) return null;

  return accountNameById.get(transaction.counterpartAccountId) ?? "Cuenta externa";
}
