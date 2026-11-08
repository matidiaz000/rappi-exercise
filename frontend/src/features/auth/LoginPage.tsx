import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { LoginErrors, LoginValues } from "../../domain/auth/validation";
import { validateLogin } from "../../domain/auth/validation";
import { isApiError } from "../../infrastructure/api/errors";
import { useDocumentTitle } from "../../shared/useDocumentTitle";
import { Button } from "../../ui/Button";
import { Field, Input, PasswordInput } from "../../ui/form";
import { InlineNotice, SecurityNote } from "../../ui/States";
import { useAuth } from "./AuthProvider";
import { DemoCredentials } from "./DemoCredentials";

interface LoginLocationState {
  from?: string;
  registered?: boolean;
}

export function LoginPage() {
  useDocumentTitle("Ingresar");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState | null;

  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof LoginValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateLogin(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setApiError(null);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      await login(values.email, values.password);
      navigate(locationState?.from || "/billetera", { replace: true });
    } catch (error) {
      setApiError(
        isApiError(error)
          ? error.message
          : "No pudimos iniciar sesión. Probá de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemoCredentials(email: string, password: string) {
    setValues({ email, password });
    setErrors({});
    setApiError(null);
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-medium text-bill">Billetera personal</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          Entrá a tu cuenta
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Revisá tus saldos, movimientos y transferencias.
        </p>
      </div>

      {locationState?.registered ? (
        <InlineNotice tone="success" className="mb-5">
          El registro de ejemplo se completó, pero no crea un usuario en la
          API. Para entrar, usá una de las cuentas de prueba.
        </InlineNotice>
      ) : null}

      {apiError ? (
        <InlineNotice tone="danger" className="mb-5">
          {apiError}
        </InlineNotice>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Email" htmlFor="login-email" error={errors.email}>
          <Input
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="nombre@dominio.com"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            autoFocus
          />
        </Field>

        <Field
          label="Contraseña"
          htmlFor="login-password"
          error={errors.password}
        >
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : undefined}
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <Link
            to="/recuperar-usuario"
            className="font-medium text-bill underline-offset-4 hover:underline"
          >
            Olvidé mi usuario
          </Link>
          <Link
            to="/recuperar-contrasena"
            className="font-medium text-bill underline-offset-4 hover:underline"
          >
            Olvidé mi contraseña
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={submitting}>
          {submitting ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-muted">
        ¿No tenés cuenta?{" "}
        <Link
          to="/registro"
          className="font-medium text-bill underline-offset-4 hover:underline"
        >
          Crear una cuenta
        </Link>
      </p>

      <div className="mt-7">
        <DemoCredentials onSelect={fillDemoCredentials} disabled={submitting} />
      </div>

      <div className="mt-5">
        <SecurityNote>
          En esta demo la sesión se guarda en el almacenamiento local del
          navegador. No uses contraseñas reales y cerrá sesión si compartís el
          dispositivo.
        </SecurityNote>
      </div>
    </div>
  );
}
