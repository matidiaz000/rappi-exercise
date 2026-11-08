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

interface TransactionTableProps {
  transactions: Transaction[];
  accountNameById: ReadonlyMap<string, string>;
}

export function TransactionTable({
  transactions,
  accountNameById,
}: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="text-xs font-medium text-ink-muted">
            <th scope="col" className="pb-2 pl-1 font-medium">
              Movimiento
            </th>
            <th scope="col" className="pb-2 font-medium">
              Fecha
            </th>
            <th scope="col" className="pb-2 font-medium">
              Estado
            </th>
            <th scope="col" className="pb-2 pr-1 text-right font-medium">
              Monto
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const view = describeTransaction(transaction);
            const accountName = accountNameById.get(transaction.accountId);
            const counterpart = getCounterpartLabel(
              transaction,
              accountNameById,
            );
            const meta = [view.categoryLabel, accountName, counterpart ? `con ${counterpart}` : null]
              .filter(Boolean)
              .join(" · ");

            return (
              <tr
                key={transaction.id}
                className="border-t border-line/70 align-middle"
              >
                <td className="py-3 pl-1 pr-4">
                  <div className="flex items-center gap-3">
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
                    <div className="min-w-0">
                      <p className="max-w-[24rem] truncate font-medium text-ink">
                        {view.title}
                      </p>
                      <p className="truncate text-xs text-ink-muted">{meta}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-xs text-ink-muted">
                  {formatDate(transaction.createdAt)}
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="py-3 pr-1 text-right">
                  <Money
                    amount={transaction.amount}
                    currency={transaction.currency}
                    sign={view.sign}
                    tone={view.tone}
                    size="sm"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
