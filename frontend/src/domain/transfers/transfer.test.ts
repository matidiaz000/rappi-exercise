import { describe, expect, it } from "vitest";
import {
  evaluateTransfer,
  isTerminalStatus,
  isTransferPending,
  shouldPollTransfer,
  transferStatusLabel,
} from "./transfer";

const source = {
  id: "acc-1",
  name: "Cuenta Pesos",
  currency: "ARS" as const,
  balanceCents: 100_00,
};

const destination = {
  id: "acc-3",
  name: "Cuenta Principal",
  currency: "ARS" as const,
};

describe("evaluateTransfer", () => {
  it("permite una transferencia válida en la misma moneda", () => {
    expect(
      evaluateTransfer({ amountCents: 50_00, source, destination }),
    ).toEqual({ ok: true });
  });

  it("exige cuenta de origen", () => {
    const result = evaluateTransfer({
      amountCents: 100,
      source: null,
      destination,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("missing-source");
  });

  it("exige cuenta de destino", () => {
    const result = evaluateTransfer({
      amountCents: 100,
      source,
      destination: null,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("missing-destination");
  });

  it("bloquea transferir a la misma cuenta", () => {
    const result = evaluateTransfer({
      amountCents: 100,
      source,
      destination: { ...source },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("same-account");
  });

  it("exige un monto entero mayor a cero", () => {
    for (const amountCents of [null, 0, -1, 10.5]) {
      const result = evaluateTransfer({ amountCents, source, destination });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe("invalid-amount");
    }
  });

  it("bloquea monedas distintas y explica que no hay conversión", () => {
    const result = evaluateTransfer({
      amountCents: 100,
      source,
      destination: { ...destination, currency: "USD" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("currency-mismatch");
      expect(result.message).toMatch(/no hace conversión/);
    }
  });

  it("bloquea fondos insuficientes con el saldo disponible en el mensaje", () => {
    const result = evaluateTransfer({
      amountCents: 100_01,
      source,
      destination,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("insufficient-funds");
      expect(result.message).toContain("ARS 100,00");
    }
  });

  it("permite transferir exactamente el saldo disponible", () => {
    expect(
      evaluateTransfer({ amountCents: 100_00, source, destination }),
    ).toEqual({ ok: true });
  });
});

describe("estados de transferencia", () => {
  it("identifica estados terminales", () => {
    expect(isTerminalStatus("completed")).toBe(true);
    expect(isTerminalStatus("failed")).toBe(true);
    expect(isTerminalStatus("pending")).toBe(false);
  });

  it("solo pollea mientras está pendiente", () => {
    expect(shouldPollTransfer("pending")).toBe(true);
    expect(shouldPollTransfer("completed")).toBe(false);
    expect(shouldPollTransfer("failed")).toBe(false);
    expect(shouldPollTransfer(undefined)).toBe(false);
  });

  it("expone etiquetas en español", () => {
    expect(transferStatusLabel("pending")).toBe("En curso");
    expect(transferStatusLabel("completed")).toBe("Completada");
    expect(transferStatusLabel("failed")).toBe("Fallida");
    expect(isTransferPending("pending")).toBe(true);
  });
});
