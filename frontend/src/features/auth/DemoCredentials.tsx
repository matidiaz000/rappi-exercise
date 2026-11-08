import { Button } from "../../ui/Button";

const DEMO_ACCOUNTS = [
  {
    name: "Usuario Demo",
    email: "demo@example.com",
    password: "demo123",
    detail: "ARS + USD",
  },
  {
    name: "Test User",
    email: "test@example.com",
    password: "test123",
    detail: "ARS",
  },
  {
    name: "Ana Perez",
    email: "ana@example.com",
    password: "ana123",
    detail: "ARS",
  },
] as const;

interface DemoCredentialsProps {
  onSelect: (email: string, password: string) => void;
  disabled?: boolean;
}

export function DemoCredentials({ onSelect, disabled }: DemoCredentialsProps) {
  return (
    <section
      className="rounded-2xl border border-line bg-surface/70 p-4"
      aria-labelledby="demo-credentials-title"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="demo-credentials-title"
          className="text-sm font-medium text-ink"
        >
          Cuentas de prueba
        </h2>
        <span className="text-[11px] text-ink-muted">mock API</span>
      </div>
      <p className="mt-1 text-xs leading-5 text-ink-muted">
        Elegí una para completar el formulario. El registro no crea usuarios
        nuevos en la API.
      </p>

      <ul className="mt-3 divide-y divide-line/80">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.email} className="flex items-center gap-2 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-ink">
                {account.name}
                <span className="ml-1.5 font-normal text-ink-muted">
                  {account.detail}
                </span>
              </p>
              <p className="truncate font-mono text-[11px] leading-5 text-ink-muted">
                {account.email} · {account.password}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => onSelect(account.email, account.password)}
              aria-label={`Usar credenciales de ${account.name}`}
            >
              Usar
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
