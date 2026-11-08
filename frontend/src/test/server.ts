import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const API_BASE_URL = "http://localhost:3000";

export const DEMO_SESSION = {
  token: "fake-token-user-1",
  user: {
    id: "user-1",
    email: "demo@example.com",
    name: "Usuario Demo",
  },
} as const;

export const handlers = [
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (
      body.email === DEMO_SESSION.user.email &&
      body.password === "demo123"
    ) {
      return HttpResponse.json(DEMO_SESSION);
    }

    return HttpResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }),

  http.get(`${API_BASE_URL}/accounts`, () => {
    return HttpResponse.json({
      accounts: [
        {
          id: "acc-1",
          userId: "user-1",
          name: "Cuenta Pesos",
          currency: "ARS",
          createdAt: "2026-01-01T00:00:00.000Z",
          balance: 125000.5,
        },
        {
          id: "acc-2",
          userId: "user-1",
          name: "Cuenta Dolares",
          currency: "USD",
          createdAt: "2026-01-01T00:00:00.000Z",
          balance: 320.25,
        },
      ],
    });
  }),

  http.get(`${API_BASE_URL}/transactions`, () => {
    return HttpResponse.json({
      transactions: [],
      pagination: { page: 1, pageSize: 10, total: 0 },
    });
  }),

  http.get(`${API_BASE_URL}/categories`, () => {
    return HttpResponse.json({
      categories: [
        "salary",
        "freelance",
        "rent",
        "groceries",
        "transport",
        "entertainment",
        "utilities",
        "health",
        "transfer",
        "other",
      ],
    });
  }),
];

export const server = setupServer(...handlers);
