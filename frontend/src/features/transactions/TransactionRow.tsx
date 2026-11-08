import type { Transaction } from "../../domain/entities";
import { formatDate } from "../../domain/format";
import {
  describeTransaction,
  getCounterpartLabel,
} from "../../domain/transactions/presentation";
import { cn } from "../../shared/cn";
import { Money } from "../../ui/Money";
import { StatusBadge } from "../../ui/StatusBadge";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  SendIcon,
} from "../../ui/icons";

interface TransactionRowProps {
  transaction: Transaction;
  accountName?: string;
  accountNameById?: ReadonlyMap<string, string>;
  className?: string;
}

export function TransactionRow({
  transaction,
  accountName,
  accountNameById,
  className,
}: TransactionRowProps) {
  const view = describeTransaction(transaction);
  const counterpart = accountNameById
    ? getCounterpartLabel(transaction, accountNameById)
    : null;

  const meta = [
    view.categoryLabel,
    accountName,
    counterpart ? `con ${counterpart}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className={cn("flex items-center gap-3 py-3.5", className)}>
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full",
          view.tone === "positive" && "bg-bill-soft text-bill-deep",
          view.tone === "negative" && "bg-danger-soft text-danger",
          view.tone === "pending" && "bg-pending-soft text-pending",
        )}
        aria-hidden="true"
      >
        {view.isTransfer && !view.isPending ? (
          <SendIcon className="size-[18px]" />
        ) : view.direction === "in" ? (
          <ArrowDownLeftIcon className="size-[18px]" />
        ) : (
          <ArrowUpRightIcon className="size-[18px]" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{view.title}</p>
        <p className="truncate text-xs text-ink-muted">{meta}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <Money
          amount={transaction.amount}
          currency={transaction.currency}
          sign={view.sign}
          tone={view.tone}
          size="sm"
        />
        {view.isPending || transaction.status === "failed" ? (
          <StatusBadge status={transaction.status} />
        ) : (
          <span className="text-xs text-ink-muted">
            {formatDate(transaction.createdAt)}
          </span>
        )}
      </div>
    </li>
  );
}
