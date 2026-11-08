import type {
  Account,
  AuthUser,
  NewTransactionInput,
  NewTransferInput,
  Transaction,
  TransactionPage,
  TransactionStatus,
  TransactionType,
  Transfer,
} from "../../domain/entities";
import { invalidResponseError } from "./errors";
import type { HttpClient } from "./client";
import {
  accountsResponseSchema,
  categoriesResponseSchema,
  loginResponseSchema,
  transactionPageSchema,
  transactionResponseSchema,
  transferResponseSchema,
} from "./schemas";

function parseData<T>(
  schema: {
    safeParse: (
      data: unknown,
    ) => { success: true; data: T } | { success: false; error: unknown };
  },
  payload: unknown,
): T {
  const result = schema.safeParse(payload);
  if (!result.success) throw invalidResponseError(result.error);
  return result.data;
}

export interface TransactionsQuery {
  accountId?: string;
  type?: TransactionType;
  category?: string;
  status?: TransactionStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

function normalizeQuery(query: TransactionsQuery): Record<string, string | number | undefined> {
  return {
    accountId: query.accountId || undefined,
    type: query.type || undefined,
    category: query.category || undefined,
    status: query.status || undefined,
    search: query.search || undefined,
    page: query.page,
    pageSize: query.pageSize,
  };
}

function roundAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export interface FintechApi {
  login(email: string, password: string): Promise<LoginResult>;
  getAccounts(): Promise<Account[]>;
  getTransactions(query: TransactionsQuery): Promise<TransactionPage>;
  getCategories(): Promise<string[]>;
  createTransaction(input: NewTransactionInput): Promise<Transaction>;
  createTransfer(input: NewTransferInput): Promise<Transfer>;
  getTransfer(transferId: string): Promise<Transfer>;
}

export function createFintechApi(http: HttpClient): FintechApi {
  return {
    async login(email: string, password: string): Promise<LoginResult> {
      const payload = await http.request<unknown>("/auth/login", {
        method: "POST",
        auth: false,
        body: { email: email.trim().toLowerCase(), password },
      });
      return parseData(loginResponseSchema, payload);
    },

    async getAccounts(): Promise<Account[]> {
      const payload = await http.request<unknown>("/accounts");
      return parseData(accountsResponseSchema, payload).accounts;
    },

    async getTransactions(query: TransactionsQuery): Promise<TransactionPage> {
      const payload = await http.request<unknown>("/transactions", {
        query: normalizeQuery(query),
      });
      return parseData(transactionPageSchema, payload);
    },

    async getCategories(): Promise<string[]> {
      const payload = await http.request<unknown>("/categories");
      return parseData(categoriesResponseSchema, payload).categories;
    },

    async createTransaction(input: NewTransactionInput): Promise<Transaction> {
      const payload = await http.request<unknown>("/transactions", {
        method: "POST",
        body: {
          accountId: input.accountId,
          type: input.type,
          amount: roundAmount(input.amount),
          category: input.category || undefined,
          description: input.description?.trim() || undefined,
        },
      });
      return parseData(transactionResponseSchema, payload).transaction;
    },

    async createTransfer(input: NewTransferInput): Promise<Transfer> {
      const payload = await http.request<unknown>("/transfers", {
        method: "POST",
        body: {
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
          amount: roundAmount(input.amount),
          description: input.description?.trim() || undefined,
        },
      });
      return parseData(transferResponseSchema, payload).transfer;
    },

    async getTransfer(transferId: string): Promise<Transfer> {
      const payload = await http.request<unknown>(
        `/transfers/${encodeURIComponent(transferId)}`,
      );
      return parseData(transferResponseSchema, payload).transfer;
    },
  };
}
