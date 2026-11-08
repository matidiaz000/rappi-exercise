import { Link } from "react-router-dom";
import type { Transaction } from "../../domain/entities";
import { formatMoney } from "../../domain/money/money";
import { describeTransaction } from "../../domain/transactions/presentation";
import { Money } from "../../ui/Money";
import { StatusBadge } from "../../ui/StatusBadge";
import { ArrowRightIcon } from "../../ui/icons";
import { usePendingTransfers } from "../transactions/useTransactions";

export function PendingTransfersBanner() {
  const pendingQuery = usePendingTransfers();
  const pending = pendingQuery.data?.transactions ?? [];

  if (pending.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-[#e2cb93] bg-pending-soft/50 p-4 sm:p-5"
      aria-labelledby="pending-transfers-title"
    >
      <div className="flex items-start gap-3">
        <StatusBadge status="pending" className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <h2
            id="pending-transfers-title"
            className="font-display text-base font-semibold text-ink"
          >
            {pending.length === 1
              ? "Tenés una transferencia en curso"
              : `Tenés ${pending.length} transferencias en curso`}
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-ink-soft">
            Se actualiza automáticamente cada pocos segundos. El saldo recién
            cambia cuando la operación se completa.
          </p>

          <ul className="mt-3 space-y-2">
            {pending.map((transaction: Transaction) => {
              const view = describeTransaction(transaction);
              return (
                <li
                  key={transaction.id}
                  className="flex items-center gap-3 rounded-xl border border-[#e2cb93]/70 bg-surface/70 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {view.title}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {view.direction === "out" ? "Enviada" : "Recibida"} ·{" "}
                      {formatMoney({
                        cents: Math.round(transaction.amount * 100),
                        currency: transaction.currency,
                      })}
                    </p>
                  </div>
                  <Money
                    amount={transaction.amount}
                    currency={transaction.currency}
                    sign={view.sign}
                    tone="pending"
                    size="sm"
                  />
                  {transaction.transferId ? (
                    <Link
                      to={`/transferir/${transaction.transferId}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-pending underline-offset-4 hover:underline"
                    >
                      Ver estado
                      <ArrowRightIcon className="size-3.5" />
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
