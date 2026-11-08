import { describe, expect, it } from "vitest";
import {
  getPasswordStrength,
  hasErrors,
  validateEmail,
  validateLogin,
  validateName,
  validateNewPassword,
  validateRegister,
} from "./validation";

describe("validateEmail", () => {
  it("acepta emails razonables", () => {
    expect(validateEmail("demo@example.com")).toBeNull();
    expect(validateEmail("  ana.perez@sub.dominio.com  ")).toBeNull();
  });

  it("rechaza vacío, formato inválido y emails largos", () => {
    expect(validateEmail("")).toMatch(/Ingresá tu email/);
    expect(validateEmail("demo@example")).toMatch(/email válido/);
    expect(validateEmail("sin-arroba.com")).toMatch(/email válido/);
    expect(validateEmail(`${"a".repeat(250)}@x.com`)).toMatch(/255/);
  });
});

describe("validateLogin", () => {
  it("no devuelve errores con credenciales completas", () => {
    expect(
      validateLogin({ email: "demo@example.com", password: "demo123" }),
    ).toEqual({});
  });

  it("marca ambos campos cuando están vacíos", () => {
    const errors = validateLogin({ email: "", password: "" });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(hasErrors(errors)).toBe(true);
  });
});

describe("validateName", () => {
  it("exige entre 2 y 60 caracteres", () => {
    expect(validateName("A")).toMatch(/al menos 2/);
    expect(validateName("Usuario Demo")).toBeNull();
    expect(validateName("a".repeat(61))).toMatch(/60/);
  });
});

describe("validateNewPassword", () => {
  it("exige largo mínimo y combinación de letra y número", () => {
    expect(validateNewPassword("corta1")).toMatch(/8 caracteres/);
    expect(validateNewPassword("sololetras")).toMatch(/letra y un número/);
    expect(validateNewPassword("12345678")).toMatch(/letra y un número/);
    expect(validateNewPassword("demo1234")).toBeNull();
  });
});

describe("validateRegister", () => {
  const valid = {
    name: "Ana Perez",
    email: "ana@example.com",
    password: "demo1234",
    confirmPassword: "demo1234",
    acceptedTerms: true,
  };

  it("acepta un formulario completo", () => {
    expect(validateRegister(valid)).toEqual({});
  });

  it("detecta contraseñas que no coinciden", () => {
    const errors = validateRegister({
      ...valid,
      confirmPassword: "otra1234",
    });
    expect(errors.confirmPassword).toMatch(/no coinciden/);
  });

  it("exige aceptar los términos", () => {
    const errors = validateRegister({ ...valid, acceptedTerms: false });
    expect(errors.acceptedTerms).toBeDefined();
  });
});

describe("getPasswordStrength", () => {
  it("crece con largo, mezcla de tipos y símbolos", () => {
    expect(getPasswordStrength("").score).toBe(0);
    expect(getPasswordStrength("abc").score).toBe(0);
    expect(getPasswordStrength("abcdefg1").score).toBe(2);
    expect(getPasswordStrength("abcdefghij1!").score).toBe(4);
  });

  it("siempre devuelve una etiqueta", () => {
    expect(getPasswordStrength("demo1234").label).toBeTruthy();
  });
});
