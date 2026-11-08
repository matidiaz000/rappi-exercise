import type { Currency } from "../entities";

export const CURRENCIES: readonly Currency[] = ["ARS", "USD", "EUR"];

/** 999.999.999,99: un techo razonable para una billetera personal. */
export const MAX_MONEY_CENTS = 99_999_999_999;

/**
 * El dinero vive en centavos enteros dentro del dominio. La API trabaja con
 * decimales, así que la conversión ocurre únicamente en el borde (infra).
 */
export interface Money {
  readonly cents: number;
  readonly currency: Currency;
}

export function toCents(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100);
}

export function moneyFromDecimal(amount: number, currency: Currency): Money {
  return { cents: toCents(amount), currency };
}

export function moneyFromCents(cents: number, currency: Currency): Money {
  return { cents: Math.round(cents), currency };
}

export function toDecimal(money: Money): number {
  return Math.round(money.cents) / 100;
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(
      `No se pueden operar montos de monedas distintas (${a.currency} y ${b.currency}).`,
    );
  }
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { cents: a.cents + b.cents, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { cents: a.cents - b.cents, currency: a.currency };
}

/** -1 si a < b, 1 si a > b, 0 si son iguales. */
export function compareMoney(a: Money, b: Money): -1 | 0 | 1 {
  assertSameCurrency(a, b);
  if (a.cents < b.cents) return -1;
  if (a.cents > b.cents) return 1;
  return 0;
}

export function isZero(money: Money): boolean {
  return money.cents === 0;
}

export function isNegative(money: Money): boolean {
  return money.cents < 0;
}

const amountFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Devuelve "1.234,56" sin símbolo ni código de moneda. */
export function formatAmount(money: Money): string {
  return amountFormatter.format(money.cents / 100);
}

/** Devuelve "ARS 1.234,56". La moneda siempre es explícita. */
export function formatMoney(money: Money): string {
  return `${money.currency} ${formatAmount(money)}`;
}

export function formatCents(cents: number, currency: Currency): string {
  return formatMoney(moneyFromCents(cents, currency));
}

export type AmountParseError =
  | "empty"
  | "format"
  | "too-many-decimals"
  | "too-large";

export type AmountParseResult =
  | { ok: true; value: Money }
  | { ok: false; error: AmountParseError; message: string };

const ERROR_MESSAGES: Record<AmountParseError, string> = {
  empty: "Ingresá un monto.",
  format: "Usá solo números. Podés separar los decimales con coma o punto.",
  "too-many-decimals": "El monto admite como máximo dos decimales.",
  "too-large": "El monto supera el límite permitido.",
};

function parseError(error: AmountParseError): AmountParseResult {
  return { ok: false, error, message: ERROR_MESSAGES[error] };
}

interface SplitAmount {
  integer: string;
  fraction: string;
}

/**
 * Interpreta montos escritos por una persona en formato es-AR y también el
 * formato decimal "de sistema". Es deliberadamente estricto con los casos
 * ambiguos: es preferible pedir que se corrija antes que mover otro monto.
 */
function splitAmount(raw: string): SplitAmount | null {
  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  if (hasComma && hasDot) {
    const decimalSeparator = raw.lastIndexOf(",") > raw.lastIndexOf(".") ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    const withoutThousands = raw.split(thousandSeparator).join("");
    const index = withoutThousands.lastIndexOf(decimalSeparator);
    return {
      integer: withoutThousands.slice(0, index),
      fraction: withoutThousands.slice(index + 1),
    };
  }

  const separator = hasComma ? "," : hasDot ? "." : null;
  if (!separator) {
    return { integer: raw, fraction: "" };
  }

  const parts = raw.split(separator);

  if (parts.length > 2) {
    const looksLikeThousands =
      separator === "." &&
      parts.slice(1).every((part) => part.length === 3);
    return looksLikeThousands
      ? { integer: parts.join(""), fraction: "" }
      : null;
  }

  const [integer, fraction] = parts;

  if (separator === ",") {
    return { integer, fraction };
  }

  if (fraction.length === 0) return { integer, fraction: "" };
  if (fraction.length <= 2) return { integer, fraction };
  if (fraction.length === 3) return { integer: `${integer}${fraction}`, fraction: "" };

  return null;
}

export function parseAmount(
  input: string,
  currency: Currency,
): AmountParseResult {
  const raw = input.trim().replace(/\s/g, "").replace(/\$/g, "");

  if (!raw) return parseError("empty");
  if (!/\d/.test(raw) || !/^[\d.,]+$/.test(raw)) return parseError("format");

  const split = splitAmount(raw);
  if (!split) return parseError("format");

  const integer = split.integer === "" ? "0" : split.integer;
  const fraction = split.fraction;

  if (!/^\d+$/.test(integer) || !/^\d*$/.test(fraction)) {
    return parseError("format");
  }
  if (fraction.length > 2) return parseError("too-many-decimals");
  if (integer.length > 12) return parseError("too-large");

  const cents = Number(integer) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) return parseError("too-large");
  if (cents > MAX_MONEY_CENTS) return parseError("too-large");

  return { ok: true, value: moneyFromCents(cents, currency) };
}

export function isSupportedCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}
