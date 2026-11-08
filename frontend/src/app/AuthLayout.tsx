import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { Logo } from "../ui/Logo";

export function AuthLayout() {
  useEffect(() => {
    document.title = "Ingresar · Cauce";
  }, []);

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <aside className="guilloche relative hidden overflow-hidden bg-sidebar text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute -right-28 -top-28 size-[28rem] rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 size-[32rem] rounded-full border border-white/[0.07]"
          aria-hidden="true"
        />
        <Logo tone="light" />

        <div className="relative max-w-md">
          <p className="font-display text-[2.7rem] font-semibold leading-[1.08] tracking-tight">
            Todo lo que entra, sale y se transfiere. En un solo lugar.
          </p>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-white/65">
            Cauce ordena tus saldos en pesos y dólares, y te muestra en qué
            estado está cada operación.
          </p>

          <ul className="mt-10 space-y-4 text-sm text-white/75">
            <li className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-[#6fd0ae]" />
              Saldos separados por moneda, sin conversiones implícitas.
            </li>
            <li className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-[#6fd0ae]" />
              Transferencias con seguimiento hasta que se completan.
            </li>
            <li className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-[#6fd0ae]" />
              Historial con filtros y montos siempre identificables.
            </li>
          </ul>
        </div>

        <p className="relative text-xs leading-5 text-white/40">
          Producto de demostración construido sobre el mock API del ejercicio
          fintech 2026. No procesa dinero real.
        </p>
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:justify-end">
          <Link to="/login" className="lg:hidden" aria-label="Cauce, ir al ingreso">
            <Logo />
          </Link>
          <p className="hidden text-xs text-ink-muted sm:block">
            Billetera personal
          </p>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[27rem]">
            <Outlet />
          </div>
        </main>

        <footer className="px-5 py-5 text-center text-xs text-ink-muted sm:px-8">
          Cauce · Demo fintech 2026
        </footer>
      </div>
    </div>
  );
}
