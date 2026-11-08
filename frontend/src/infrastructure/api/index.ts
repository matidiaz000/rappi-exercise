import { createHttpClient } from "./client";
import { createFintechApi } from "./fintechApi";
import { authEvents } from "../events/authEvents";
import { readSession } from "../storage/sessionStorage";

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3000";

export const httpClient = createHttpClient({
  baseUrl,
  getToken: () => readSession()?.token ?? null,
  onUnauthorized: () => authEvents.emitUnauthorized(),
});

export const api = createFintechApi(httpClient);

export type { TransactionsQuery } from "./fintechApi";
