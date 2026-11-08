import { z } from "zod";

export const currencySchema = z.enum(["ARS", "USD", "EUR"]);
export const transactionStatusSchema = z.enum([
  "pending",
  "completed",
  "failed",
]);
export const transactionTypeSchema = z.enum(["income", "expense", "transfer"]);

export const authUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  name: z.string().min(1),
});

export const loginResponseSchema = z.object({
  token: z.string().min(1),
  user: authUserSchema,
});

export const accountSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string(),
  currency: currencySchema,
  createdAt: z.string(),
  balance: z.number().finite(),
});

export const accountsResponseSchema = z.object({
  accounts: z.array(accountSchema),
});

export const transactionSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  type: transactionTypeSchema,
  direction: z.enum(["in", "out"]).nullish().transform((value) => value ?? null),
  amount: z.number().finite(),
  currency: currencySchema,
  category: z.string().nullish().transform((value) => value ?? null),
  description: z.string().nullish().transform((value) => value ?? null),
  status: transactionStatusSchema,
  counterpartAccountId: z
    .string()
    .nullish()
    .transform((value) => value ?? null),
  transferId: z.string().nullish().transform((value) => value ?? null),
  createdAt: z.string(),
});

export const transactionPageSchema = z.object({
  transactions: z.array(transactionSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

export const transactionResponseSchema = z.object({
  transaction: transactionSchema,
});

export const transferSchema = z.object({
  id: z.string().min(1),
  status: transactionStatusSchema,
  from: transactionSchema.nullable(),
  to: transactionSchema.nullable(),
});

export const transferResponseSchema = z.object({
  transfer: transferSchema,
});

export const categoriesResponseSchema = z.object({
  categories: z.array(z.string()),
});

export const sessionSchema = z.object({
  token: z.string().min(1),
  user: authUserSchema,
  loggedInAt: z.string().min(1),
});
