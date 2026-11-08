import type { Session } from "../../domain/entities";
import { sessionSchema } from "../api/schemas";

export const SESSION_STORAGE_KEY = "cauce.session.v1";

export function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    const parsed = sessionSchema.safeParse(payload);
    if (!parsed.success) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export function writeSession(session: Session): boolean {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Si el storage no está disponible, la sesión en memoria se limpia igual.
  }
}
