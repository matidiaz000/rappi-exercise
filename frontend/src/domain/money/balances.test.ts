import { describe, expect, it } from "vitest";
import { groupBalancesByCurrency, CURRENCY_NAMES } from "./balances";

describe("groupBalancesByCurrency", () => {
  it("agrupa por moneda y suma en centavos", () => {
    const balances = groupBalancesByCurrency([
      { currency: "ARS", balance: 10.5 },
      { currency: "ARS", balance: 4.25 },
      { currency: "USD", balance: 3 },
    ]);

    expect(balances).toEqual([
      { currency: "ARS", cents: 1475, accountCount: 2 },
      { currency: "USD", cents: 300, accountCount: 1 },
    ]);
  });

  it("mantiene un orden estable aunque cambie el orden de entrada", () => {
    const first = groupBalancesByCurrency([
      { currency: "USD", balance: 1 },
      { currency: "ARS", balance: 2 },
    ]);
    const second = groupBalancesByCurrency([
      { currency: "ARS", balance: 2 },
      { currency: "USD", balance: 1 },
    ]);

    expect(first).toEqual(second);
    expect(first.map((balance) => balance.currency)).toEqual(["ARS", "USD"]);
  });

  it("devuelve una lista vacía sin cuentas", () => {
    expect(groupBalancesByCurrency([])).toEqual([]);
  });

  it("tiene un nombre legible para cada moneda", () => {
    expect(CURRENCY_NAMES.ARS).toBe("Pesos argentinos");
    expect(CURRENCY_NAMES.USD).toBe("Dólares");
    expect(CURRENCY_NAMES.EUR).toBe("Euros");
  });
});
