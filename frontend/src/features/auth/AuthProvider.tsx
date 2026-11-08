import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthUser, Session } from "../../domain/entities";
import { api } from "../../infrastructure/api";
import { authEvents } from "../../infrastructure/events/authEvents";
import {
  clearSession,
  readSession,
  writeSession,
} from "../../infrastructure/storage/sessionStorage";

interface AuthContextValue {
  session: Session | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(() => readSession());

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    return authEvents.onUnauthorized(() => {
      logout();
    });
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string): Promise<Session> => {
      const result = await api.login(email, password);
      const nextSession: Session = {
        token: result.token,
        user: result.user,
        loggedInAt: new Date().toISOString(),
      };

      writeSession(nextSession);
      setSession(nextSession);
      // Evita que datos de una sesión anterior queden visibles.
      queryClient.clear();

      return nextSession;
    },
    [queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }
  return context;
}
