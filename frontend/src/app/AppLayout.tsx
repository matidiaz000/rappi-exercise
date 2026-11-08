import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { cn } from "../shared/cn";
import { Avatar } from "../ui/Avatar";
import {
  LedgerIcon,
  LogOutIcon,
  SendIcon,
  UserIcon,
  WalletIcon,
} from "../ui/icons";
import { Logo } from "../ui/Logo";

const NAV_ITEMS = [
  { to: "/billetera", label: "Billetera", icon: WalletIcon },
  { to: "/historial", label: "Historial", icon: LedgerIcon },
  { to: "/transferir", label: "Transferir", icon: SendIcon },
  { to: "/cuenta", label: "Cuenta", icon: UserIcon },
] as const;

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-svh md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <ScrollToTop />

      <aside className="sticky top-0 hidden h-svh flex-col border-r border-white/5 bg-sidebar px-5 py-7 text-white md:flex">
        <Link to="/billetera" aria-label="Cauce, ir a la billetera" className="px-2">
          <Logo tone="light" />
        </Link>

        <nav aria-label="Secciones" className="mt-10 flex flex-col gap-1">
          <p className="px-3 pb-2 text-xs font-medium text-white/40">
            Tu billetera
          </p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "size-[18px]",
                      isActive ? "text-[#6fd0ae]" : "text-white/45",
                    )}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name ?? "?"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-white/45">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              <LogOutIcon className="size-4" />
              Cerrar sesión
            </button>
          </div>
          <p className="mt-4 px-2 text-[11px] leading-5 text-white/30">
            Sesión guardada localmente. No compartas este dispositivo.
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/80 bg-paper/90 px-4 py-3 backdrop-blur md:hidden">
          <Link to="/billetera" aria-label="Cauce, ir a la billetera">
            <Logo compact />
          </Link>
          <Link
            to="/cuenta"
            className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-xs font-medium text-ink-soft"
            aria-label="Ver mi cuenta"
          >
            <Avatar name={user?.name ?? "?"} size="sm" />
            <span className="max-w-28 truncate">{user?.name}</span>
          </Link>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-12 md:pt-8 lg:px-10 lg:pt-10">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex min-w-16 flex-1 flex-col items-center gap-1 px-2 pb-2.5 pt-2 text-[11px] font-medium transition-colors",
                  isActive ? "text-bill" : "text-ink-muted",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid h-7 w-11 place-items-center rounded-full transition-colors",
                      isActive && "bg-bill-soft",
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
