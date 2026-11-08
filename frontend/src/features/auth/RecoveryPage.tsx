import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { validateEmailOnly } from "../../domain/auth/validation";
import { useDocumentTitle } from "../../shared/useDocumentTitle";
import { Button } from "../../ui/Button";
import { Field, Input } from "../../ui/form";
import { CheckIcon, MailIcon } from "../../ui/icons";
import { InlineNotice, SecurityNote } from "../../ui/States";

type RecoveryMode = "user" | "password";

const COPY: Record<
  RecoveryMode,
  {
    title: string;
    documentTitle: string;
    description: string;
    successTitle: string;
    successBody: string;
    otherLabel: string;
    otherTo: string;
  }
> = {
  user: {
    title: "Recuperar usuario",
    documentTitle: "Recuperar usuario",
    description:
      "En Cauce tu usuario es el email con el que ingresás. Decinos cuál creés que usaste.",
    successTitle: "Revisá tu email",
    successBody:
      "Si ese email está asociado a una cuenta, tu usuario es el mismo email que ingresaste. Por seguridad no confirmamos si existe o no.",
    otherLabel: "Recuperar contraseña",
    otherTo: "/recuperar-contrasena",
  },
  password: {
    title: "Recuperar contraseña",
    documentTitle: "Recuperar contraseña",
    description:
      "Ingresá tu email y te enviaríamos un enlace para crear una contraseña nueva.",
    successTitle: "Revisá tu email",
    successBody:
      "Si el email está asociado a una cuenta, te enviaríamos un enlace para restablecer la contraseña. Esta demo no envía correos ni modifica contraseñas.",
    otherLabel: "Recuperar usuario",
    otherTo: "/recuperar-usuario",
  },
};

function RecoveryPage({ mode }: { mode: RecoveryMode }) {
  const copy = COPY[mode];
  useDocumentTitle(copy.documentTitle);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateEmailOnly(email);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div>
        <div className="grid size-12 place-items-center rounded-full bg-bill-soft text-bill-deep">
          <CheckIcon className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">
          {copy.successTitle}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{copy.successBody}</p>

        <InlineNotice tone="info" className="mt-5">
          Enviado a <span className="font-medium">{email.trim()}</span>. No
          compartimos este dato con nadie más.
        </InlineNotice>

        <Button fullWidth size="lg" className="mt-6" onClick={() => setSubmitted(false)}>
          Usar otro email
        </Button>

        <Link
          to="/login"
          className="mt-4 block text-center text-sm font-medium text-bill underline-offset-4 hover:underline"
        >
          Volver al ingreso
        </Link>

        <p className="mt-5 text-center text-sm text-ink-muted">
          <Link
            to={copy.otherTo}
            className="font-medium text-bill underline-offset-4 hover:underline"
          >
            {copy.otherLabel}
          </Link>
        </p>
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
          {copy.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{copy.description}</p>
      </div>

      <InlineNotice tone="info" className="mb-5">
        Esta demo no envía correos ni consulta la base de usuarios. El flujo
        sirve para validar la experiencia.
      </InlineNotice>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Email" htmlFor={`recovery-${mode}-email`} error={error ?? undefined}>
          <Input
            id={`recovery-${mode}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="nombre@dominio.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            invalid={Boolean(error)}
            aria-describedby={
              error ? `recovery-${mode}-email-error` : undefined
            }
            autoFocus
          />
        </Field>

        <Button type="submit" fullWidth size="lg">
          <MailIcon className="size-4" />
          {mode === "user" ? "Buscar mi usuario" : "Enviar enlace"}
        </Button>
      </form>

      <div className="mt-5">
        <SecurityNote>
          Por seguridad, la respuesta es siempre la misma exista o no una cuenta
          con ese email. Así evitamos revelar qué datos tenemos.
        </SecurityNote>
      </div>

      <p className="mt-5 text-center text-sm text-ink-muted">
        <Link
          to={copy.otherTo}
          className="font-medium text-bill underline-offset-4 hover:underline"
        >
          {copy.otherLabel}
        </Link>
      </p>
    </div>
  );
}

export function ForgotUserPage() {
  return <RecoveryPage mode="user" />;
}

export function ForgotPasswordPage() {
  return <RecoveryPage mode="password" />;
}
