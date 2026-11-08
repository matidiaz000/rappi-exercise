import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type {
  RegisterErrors,
  RegisterValues,
} from "../../domain/auth/validation";
import {
  getPasswordStrength,
  validateRegister,
} from "../../domain/auth/validation";
import { useDocumentTitle } from "../../shared/useDocumentTitle";
import { cn } from "../../shared/cn";
import { Button } from "../../ui/Button";
import { Field, Input, PasswordInput } from "../../ui/form";
import { CheckIcon } from "../../ui/icons";
import { InlineNotice } from "../../ui/States";

const INITIAL_VALUES: RegisterValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const filled = password ? Math.max(1, strength.score) : 0;

  return (
    <div className="mt-1">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              level <= filled
                ? strength.score <= 1
                  ? "bg-danger"
                  : strength.score === 2
                    ? "bg-pending"
                    : "bg-bill"
                : "bg-line",
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        Seguridad:{" "}
        <span
          className={cn(
            "font-medium",
            strength.score <= 1 ? "text-danger" : "text-ink-soft",
          )}
        >
          {strength.label}
        </span>
      </p>
    </div>
  );
}

export function RegisterPage() {
  useDocumentTitle("Crear cuenta");
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [created, setCreated] = useState(false);

  function updateField<K extends keyof RegisterValues>(
    field: K,
    value: RegisterValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateRegister(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setCreated(true);
  }

  if (created) {
    return (
      <div>
        <div className="grid size-12 place-items-center rounded-full bg-bill-soft text-bill-deep">
          <CheckIcon className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">
          El registro de ejemplo quedó completo
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Validamos todos los datos, pero no creamos una cuenta real: este
          formulario no está conectado a la API.
        </p>

        <div className="mt-6">
          <InlineNotice tone="info">
            Para recorrer la billetera, ingresá con alguna de las cuentas de
            prueba que aparecen en el login.
          </InlineNotice>
        </div>

        <Button
          fullWidth
          size="lg"
          className="mt-6"
          onClick={() => navigate("/login", { state: { registered: true } })}
        >
          Ir al ingreso
        </Button>

        <Link
          to="/registro"
          onClick={() => {
            setCreated(false);
            setValues(INITIAL_VALUES);
          }}
          className="mt-4 block text-center text-sm font-medium text-bill underline-offset-4 hover:underline"
        >
          Editar los datos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/login"
          className="text-sm font-medium text-bill underline-offset-4 hover:underline"
        >
          Volver al ingreso
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
          Crear una cuenta
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Completá tus datos para ver cómo sería el alta.
        </p>
      </div>

      <InlineNotice tone="info" className="mb-5">
        Registro de demostración: valida el formulario, pero no crea un usuario
        en la API. Las cuentas para ingresar están en el login.
      </InlineNotice>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Nombre y apellido" htmlFor="register-name" error={errors.name}>
          <Input
            id="register-name"
            name="name"
            autoComplete="name"
            placeholder="Cómo querés que te llamemos"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "register-name-error" : undefined}
            autoFocus
          />
        </Field>

        <Field label="Email" htmlFor="register-email" error={errors.email}>
          <Input
            id="register-email"
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
            aria-describedby={errors.email ? "register-email-error" : undefined}
          />
        </Field>

        <Field
          label="Contraseña"
          htmlFor="register-password"
          error={errors.password}
          hint="Mínimo 8 caracteres, con al menos una letra y un número."
        >
          <PasswordInput
            id="register-password"
            name="password"
            autoComplete="new-password"
            placeholder="Creá una contraseña"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "register-password-error" : "register-password-hint"
            }
          />
          <PasswordStrength password={values.password} />
        </Field>

        <Field
          label="Repetir contraseña"
          htmlFor="register-confirm"
          error={errors.confirmPassword}
        >
          <PasswordInput
            id="register-confirm"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repetí la contraseña"
            value={values.confirmPassword}
            onChange={(event) =>
              updateField("confirmPassword", event.target.value)
            }
            invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "register-confirm-error" : undefined
            }
          />
        </Field>

        <div>
          <label className="flex items-start gap-2.5 text-sm leading-6 text-ink-soft">
            <input
              type="checkbox"
              checked={values.acceptedTerms}
              onChange={(event) =>
                updateField("acceptedTerms", event.target.checked)
              }
              className="mt-1 size-4 shrink-0 accent-[#0d7256]"
              aria-invalid={Boolean(errors.acceptedTerms) || undefined}
              aria-describedby={
                errors.acceptedTerms ? "register-terms-error" : undefined
              }
            />
            <span>
              Acepto los términos de esta demostración y entiendo que no se
              crea una cuenta real.
            </span>
          </label>
          {errors.acceptedTerms ? (
            <p id="register-terms-error" className="mt-1 text-sm text-danger" role="alert">
              {errors.acceptedTerms}
            </p>
          ) : null}
        </div>

        <Button type="submit" fullWidth size="lg">
          Crear cuenta de ejemplo
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-muted">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/login"
          className="font-medium text-bill underline-offset-4 hover:underline"
        >
          Ingresar
        </Link>
      </p>
    </div>
  );
}
