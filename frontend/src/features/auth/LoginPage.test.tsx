import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { SESSION_STORAGE_KEY } from "../../infrastructure/storage/sessionStorage";
import { renderWithProviders } from "../../test/renderWithProviders";

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/billetera" element={<h1>Billetera lista</h1>} />
    </Routes>,
    { route: "/login" },
  );
}

describe("LoginPage", () => {
  it("valida los campos vacíos sin llamar a la API", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByText("Ingresá tu email.")).toBeInTheDocument();
    expect(screen.getByText("Ingresá tu contraseña.")).toBeInTheDocument();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("completa el formulario con una cuenta de prueba", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(
      screen.getByRole("button", {
        name: /Usar credenciales de Usuario Demo/i,
      }),
    );

    expect(screen.getByLabelText("Email")).toHaveValue("demo@example.com");
    expect(screen.getByLabelText("Contraseña")).toHaveValue("demo123");
  });

  it("inicia sesión, guarda la sesión y navega a la billetera", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "demo@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "demo123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByText("Billetera lista")).toBeInTheDocument();

    await waitFor(() => {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      expect(raw).not.toBeNull();
      const session = JSON.parse(raw ?? "{}");
      expect(session.token).toBe("fake-token-user-1");
      expect(session.user.email).toBe("demo@example.com");
      expect(session.loggedInAt).toBeTruthy();
    });
  });

  it("muestra el error de la API con credenciales incorrectas", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "demo@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(
      await screen.findByText(
        "El email o la contraseña no son correctos.",
      ),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(screen.queryByText("Billetera lista")).not.toBeInTheDocument();
  });
});
