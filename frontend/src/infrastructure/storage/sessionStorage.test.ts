import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSession,
  readSession,
  SESSION_STORAGE_KEY,
  writeSession,
} from "./sessionStorage";

const session = {
  token: "fake-token-user-1",
  user: {
    id: "user-1",
    email: "demo@example.com",
    name: "Usuario Demo",
  },
  loggedInAt: "2026-01-01T00:00:00.000Z",
};

describe("sessionStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("escribe y lee una sesión válida", () => {
    expect(writeSession(session)).toBe(true);
    expect(readSession()).toEqual(session);
  });

  it("persiste bajo una clave versionada", () => {
    writeSession(session);
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toContain(
      "fake-token-user-1",
    );
  });

  it("devuelve null si no hay sesión", () => {
    expect(readSession()).toBeNull();
  });

  it("descarta JSON inválido y limpia la clave", () => {
    window.localStorage.setItem(SESSION_STORAGE_KEY, "{no-json");
    expect(readSession()).toBeNull();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("descarta sesiones con forma inválida", () => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ token: "", user: null }),
    );
    expect(readSession()).toBeNull();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("limpia la sesión", () => {
    writeSession(session);
    clearSession();
    expect(readSession()).toBeNull();
  });
});
