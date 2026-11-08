import type { Currency } from "../domain/entities";
import {
  formatAmount,
  moneyFromDecimal,
  type Money as MoneyValue,
} from "../domain/money/money";
import { cn } from "../shared/cn";

export type MoneyTone =
  | "default"
  | "positive"
  | "negative"
  | "pending"
  | "muted";

export type MoneySize = "sm" | "md" | "lg" | "xl" | "display" | "hero";

interface MoneyProps {
  amount: number;
  currency: Currency;
  hidden?: boolean;
  sign?: "+" | "-" | null;
  tone?: MoneyTone;
  size?: MoneySize;
  showCurrency?: boolean;
  inverse?: boolean;
  className?: string;
}

const TONES: Record<MoneyTone, string> = {
  default: "text-ink",
  positive: "text-bill",
  negative: "text-danger",
  pending: "text-pending",
  muted: "text-ink-muted",
};

const SIZES: Record<MoneySize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-2xl",
  display: "text-4xl sm:text-5xl",
  hero: "text-3xl sm:text-[2rem]",
};

export function Money({
  amount,
  currency,
  hidden = false,
  sign,
  tone = "default",
  size = "md",
  showCurrency = true,
  inverse = false,
  className,
}: MoneyProps) {
  const safeAmount = Number.isFinite(amount) ? Math.abs(amount) : 0;
  const money: MoneyValue = moneyFromDecimal(safeAmount, currency);

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 whitespace-nowrap font-medium tracking-tight tabular-nums",
        inverse ? "text-white" : TONES[tone],
        SIZES[size],
        className,
      )}
      aria-label={
        hidden
          ? "Monto oculto"
          : `${sign === "-" ? "menos " : sign === "+" ? "más " : ""}${currency} ${formatAmount(money)}`
      }
    >
      {sign ? (
        <span aria-hidden="true" className="translate-y-[-0.03em]">
          {sign}
        </span>
      ) : null}
      <span aria-hidden={hidden || undefined}>
        {hidden ? "••••••" : formatAmount(money)}
      </span>
      {showCurrency ? (
        <span
          className={cn(
            "font-semibold tracking-wide opacity-70",
            size === "display" ? "text-base" : "text-[0.68em]",
          )}
          aria-hidden="true"
        >
          {currency}
        </span>
      ) : null}
    </span>
  );
}

export function CurrencyBadge({
  currency,
  className,
}: {
  currency: Currency;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border border-line bg-paper px-1.5 text-[11px] font-semibold tracking-wide text-ink-soft",
        className,
      )}
    >
      {currency}
    </span>
  );
}
