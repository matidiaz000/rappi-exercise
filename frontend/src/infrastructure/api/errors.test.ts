import { describe, expect, it } from "vitest";
import { parseErrorPayload } from "./errors";

describe("parseErrorPayload", () => {
  it("traduce errores de validación por campo", () => {
    const result = parseErrorPayload(
      {
        errors: [
          { field: "amount", message: "amount must be at least 0.01" },
          { field: "email", message: "email must be a valid email" },
        ],
      },
      400,
    );

    expect(result.fieldErrors.amount).toBe("El monto debe ser mayor a cero.");
    expect(result.fieldErrors.email).toBe("Ingresá un email válido.");
    expect(result.message).toContain("El monto debe ser mayor a cero.");
  });

  it("traduce el error de credenciales inválidas", () => {
    const result = parseErrorPayload(
      { error: "Invalid email or password" },
      401,
    );
    expect(result.message).toBe("El email o la contraseña no son correctos.");
  });

  it("traduce el rechazo por fondos insuficientes (422)", () => {
    const result = parseErrorPayload(
      { error: "Insufficient funds in source account" },
      422,
    );
    expect(result.message).toMatch(/saldo de la cuenta de origen/);
    expect(result.fieldErrors).toEqual({});
  });

  it("traduce la cuenta destino inexistente", () => {
    const result = parseErrorPayload(
      { error: "Destination account not found" },
      404,
    );
    expect(result.message).toMatch(/cuenta de destino/);
  });

  it("usa un mensaje por defecto según el status", () => {
    expect(parseErrorPayload(null, 401).message).toMatch(/sesión/);
    expect(parseErrorPayload(null, 404).message).toMatch(/No encontramos/);
    expect(parseErrorPayload(null, 500).message).toMatch(/no está disponible/);
  });

  it("deja pasar mensajes desconocidos", () => {
    const result = parseErrorPayload({ error: "Algo raro pasó" }, 500);
    expect(result.message).toBe("Algo raro pasó");
  });

  it("ignora errores de campo con forma inválida", () => {
    const result = parseErrorPayload(
      { errors: [{ field: 1 }, null, { field: "amount", message: "x" }] },
      400,
    );
    expect(result.fieldErrors).toEqual({ amount: "x" });
  });
});
