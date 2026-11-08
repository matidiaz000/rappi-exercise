import type { Account, Currency } from "../entities";
import { CURRENCIES, toCents } from "./money";

export interface CurrencyBalance {
  currency: Currency;
  cents: number;
  accountCount: number;
}

/**
 * Sumar saldos solo es válido dentro de la misma moneda. El orden es estable
 * (ARS, USD, EUR) para que la interfaz no cambie de lugar entre renders.
 */
export function groupBalancesByCurrency(
  accounts: readonly Pick<Account, "currency" | "balance">[],
): CurrencyBalance[] {
  const totals = new Map<Currency, CurrencyBalance>();

  for (const account of accounts) {
    const current = totals.get(account.currency);
    if (current) {
      current.cents += toCents(account.balance);
      current.accountCount += 1;
    } else {
      totals.set(account.currency, {
        currency: account.currency,
        cents: toCents(account.balance),
        accountCount: 1,
      });
    }
  }

  return CURRENCIES.flatMap((currency) => {
    const total = totals.get(currency);
    return total ? [total] : [];
  });
}

export const CURRENCY_NAMES: Record<Currency, string> = {
  ARS: "Pesos argentinos",
  USD: "Dólares",
  EUR: "Euros",
};
