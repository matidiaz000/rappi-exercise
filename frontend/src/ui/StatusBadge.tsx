import type { TransactionStatus } from "../domain/entities";
import { cn } from "../shared/cn";
import { CheckIcon, AlertTriangleIcon } from "./icons";

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

const LABELS: Record<TransactionStatus, string> = {
  pending: "En curso",
  completed: "Completado",
  failed: "Fallido",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-xs font-medium",
        status === "pending" &&
          "border-[#e2cb93] bg-pending-soft text-[#7d5708]",
        status === "completed" && "border-[#b9d9c8] bg-bill-soft text-bill-deep",
        status === "failed" && "border-[#e8c1b9] bg-danger-soft text-danger",
        className,
      )}
    >
      {status === "pending" ? (
        <span
          className="size-1.5 rounded-full bg-current animate-pending-pulse"
          aria-hidden="true"
        />
      ) : status === "completed" ? (
        <CheckIcon className="size-3" />
      ) : (
        <AlertTriangleIcon className="size-3" />
      )}
      {LABELS[status]}
    </span>
  );
}

interface TransferStampProps {
  status: TransactionStatus;
  className?: string;
}

export function TransferStamp({ status, className }: TransferStampProps) {
  const label =
    status === "pending"
      ? "En curso"
      : status === "completed"
        ? "Completada"
        : "Fallida";

  return (
    <span
      className={cn(
        "inline-flex rotate-[-2deg] items-center gap-2 rounded-xl border-2 border-dashed px-4 py-2 font-display text-lg font-semibold",
        status === "pending" && "border-pending/70 text-pending",
        status === "completed" && "border-bill/70 text-bill animate-stamp",
        status === "failed" && "border-danger/70 text-danger",
        className,
      )}
      aria-label={`Estado de la transferencia: ${label}`}
    >
      {status === "completed" ? <CheckIcon className="size-5" /> : null}
      {label}
    </span>
  );
}
