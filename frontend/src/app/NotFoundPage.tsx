import { Link } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { buttonClasses } from "../ui/Button";

export function NotFoundPage() {
  return (
    <div className="ledger-paper flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-10 font-display text-6xl font-semibold tracking-tight text-ink">
        404
      </p>
      <h1 className="mt-3 font-display text-2xl font-semibold">
        Esta página no existe
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">
        Puede que el enlace esté mal escrito o que la sección haya cambiado de
        lugar.
      </p>
      <Link to="/billetera" className={buttonClasses({ className: "mt-6" })}>
        Ir a mi billetera
      </Link>
    </div>
  );
}
