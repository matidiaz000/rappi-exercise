import { describe, expect, it } from "vitest";
import {
  addMoney,
  compareMoney,
  formatAmount,
  formatMoney,
  isNegative,
  isZero,
  MAX_MONEY_CENTS,
  moneyFromCents,
  moneyFromDecimal,
  parseAmount,
  subtractMoney,
  toCents,
  toDecimal,
} from "./money";

function parseOk(input: string, currency: "ARS" | "USD" = "ARS") {
  const result = parseAmount(input, currency);
  if (!result.ok) throw new Error(`Se esperaba un monto válido: ${input}`);
  return result.value;
}

describe("toCents", () => {
  it("convierte decimales a centavos sin errores de punto flotante", () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(12.345)).toBe(1235);
    expect(toCents(1250)).toBe(125000);
  });

  it("devuelve 0 para valores no finitos", () => {
    expect(toCents(Number.NaN)).toBe(0);
    expect(toCents(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("parseAmount", () => {
  it("acepta coma decimal y punto de miles", () => {
    expect(parseOk("1.234,56").cents).toBe(123456);
    expect(parseOk("0,5").cents).toBe(50);
    expect(parseOk(",75").cents).toBe(75);
  });

  it("acepta punto decimal", () => {
    expect(parseOk("1234.56").cents).toBe(123456);
    expect(parseOk("0.01").cents).toBe(1);
  });

  it("interpreta un punto con tres dígitos como separador de miles", () => {
    expect(parseOk("1.234").cents).toBe(123400);
    expect(parseOk("1.234.567").cents).toBe(123456700);
  });

  it("limpia espacios y el símbolo de peso", () => {
    expect(parseOk(" $ 1.500,25 ").cents).toBe(150025);
  });

  it("rechaza montos vacíos", () => {
    const result = parseAmount("   ", "ARS");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("empty");
  });

  it("rechaza texto con letras", () => {
    const result = parseAmount("12abc", "ARS");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("format");
  });

  it("rechaza más de dos decimales en coma", () => {
    const result = parseAmount("1,234", "ARS");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("too-many-decimals");
  });

  it("rechaza montos por encima del límite", () => {
    const result = parseAmount("9999999999", "ARS");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("too-large");
    expect(parseOk(String(MAX_MONEY_CENTS / 100)).cents).toBeLessThanOrEqual(
      MAX_MONEY_CENTS,
    );
  });

  it("conserva la moneda recibida", () => {
    expect(parseOk("10", "USD").currency).toBe("USD");
  });
});

describe("formato de dinero", () => {
  it("formatea con separadores es-AR y dos decimales", () => {
    expect(formatAmount(moneyFromCents(123456, "ARS"))).toBe("1.234,56");
    expect(formatAmount(moneyFromCents(5, "USD"))).toBe("0,05");
  });

  it("incluye siempre el código de moneda", () => {
    expect(formatMoney(moneyFromCents(123456, "ARS"))).toBe("ARS 1.234,56");
    expect(formatMoney(moneyFromDecimal(10, "USD"))).toBe("USD 10,00");
  });
});

describe("operaciones entre montos", () => {
  it("suma y resta dentro de la misma moneda", () => {
    const a = moneyFromCents(1000, "ARS");
    const b = moneyFromCents(250, "ARS");

    expect(addMoney(a, b)).toEqual(moneyFromCents(1250, "ARS"));
    expect(subtractMoney(a, b)).toEqual(moneyFromCents(750, "ARS"));
  });

  it("no permite operar monedas distintas", () => {
    expect(() =>
      addMoney(moneyFromCents(100, "ARS"), moneyFromCents(100, "USD")),
    ).toThrow(/monedas distintas/);
  });

  it("compara montos", () => {
    const low = moneyFromCents(100, "ARS");
    const high = moneyFromCents(200, "ARS");

    expect(compareMoney(low, high)).toBe(-1);
    expect(compareMoney(high, low)).toBe(1);
    expect(compareMoney(low, low)).toBe(0);
  });

  it("detecta cero y negativos", () => {
    expect(isZero(moneyFromCents(0, "ARS"))).toBe(true);
    expect(isNegative(moneyFromCents(-1, "ARS"))).toBe(true);
    expect(isNegative(moneyFromCents(1, "ARS"))).toBe(false);
  });

  it("vuelve a decimal solo en el borde de la API", () => {
    expect(toDecimal(moneyFromCents(123456, "ARS"))).toBe(1234.56);
  });
});
