import { describe, expect, it } from "vitest";
import type { Transaction } from "../entities";
import {
  describeTransaction,
  getCounterpartLabel,
  getStatusLabel,
  getTransactionDirection,
} from "./presentation";

function transaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: "txn-1",
    accountId: "acc-1",
    type: "expense",
    direction: null,
    amount: 100,
    currency: "ARS",
    category: "groceries",
    description: null,
    status: "completed",
    counterpartAccountId: null,
    transferId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getTransactionDirection", () => {
  it("deriva la dirección del tipo cuando no viene explícita", () => {
    expect(getTransactionDirection(transaction({ type: "income" }))).toBe("in");
    expect(getTransactionDirection(transaction({ type: "expense" }))).toBe(
      "out",
    );
    expect(getTransactionDirection(transaction({ type: "transfer" }))).toBe(
      "out",
    );
  });

  it("respeta la dirección de una transferencia", () => {
    expect(
      getTransactionDirection(
        transaction({ type: "transfer", direction: "in" }),
      ),
    ).toBe("in");
  });
});

describe("describeTransaction", () => {
  it("usa la descripción como título si existe", () => {
    const view = describeTransaction(
      transaction({ description: "  Supermercado del barrio " }),
    );
    expect(view.title).toBe("Supermercado del barrio");
    expect(view.categoryLabel).toBe("Supermercado");
  });

  it("cae en la categoría cuando no hay descripción", () => {
    expect(describeTransaction(transaction({})).title).toBe("Supermercado");
  });

  it("describe transferencias entrantes y salientes", () => {
    expect(
      describeTransaction(
        transaction({ type: "transfer", direction: "in", category: "transfer" }),
      ).title,
    ).toBe("Transferencia recibida");

    expect(
      describeTransaction(
        transaction({ type: "transfer", direction: "out", category: "transfer" }),
      ).title,
    ).toBe("Transferencia enviada");
  });

  it("marca montos positivos, negativos y pendientes", () => {
    expect(describeTransaction(transaction({ type: "income" })).tone).toBe(
      "positive",
    );
    expect(describeTransaction(transaction({ type: "expense" })).tone).toBe(
      "negative",
    );
    expect(
      describeTransaction(transaction({ status: "pending", type: "income" }))
        .tone,
    ).toBe("pending");
  });

  it("usa el signo correcto", () => {
    expect(describeTransaction(transaction({ type: "income" })).sign).toBe("+");
    expect(describeTransaction(transaction({ type: "expense" })).sign).toBe(
      "-",
    );
  });
});

describe("getCounterpartLabel", () => {
  const names = new Map([["acc-3", "Cuenta Principal"]]);

  it("busca el nombre de la cuenta contraparte", () => {
    expect(
      getCounterpartLabel(
        transaction({
          type: "transfer",
          counterpartAccountId: "acc-3",
        }),
        names,
      ),
    ).toBe("Cuenta Principal");
  });

  it("usa un nombre genérico si no la conoce", () => {
    expect(
      getCounterpartLabel(
        transaction({
          type: "transfer",
          counterpartAccountId: "acc-999",
        }),
        names,
      ),
    ).toBe("Cuenta externa");
  });

  it("devuelve null para movimientos que no son transferencia", () => {
    expect(getCounterpartLabel(transaction({}), names)).toBeNull();
  });
});

describe("getStatusLabel", () => {
  it("traduce los estados", () => {
    expect(getStatusLabel("pending")).toBe("En curso");
    expect(getStatusLabel("completed")).toBe("Completado");
    expect(getStatusLabel("failed")).toBe("Fallido");
  });
});
