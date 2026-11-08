import { Navigate, Route, Routes } from "react-router-dom";
import { AccountPage } from "../features/account/AccountPage";
import { ForgotPasswordPage, ForgotUserPage } from "../features/auth/RecoveryPage";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { HistoryPage } from "../features/history/HistoryPage";
import { TransferPage } from "../features/transfer/TransferPage";
import { TransferReceiptPage } from "../features/transfer/TransferReceiptPage";
import { WalletPage } from "../features/wallet/WalletPage";
import { AppLayout } from "./AppLayout";
import { AuthLayout } from "./AuthLayout";
import { NotFoundPage } from "./NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnly } from "./PublicOnly";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/billetera" replace />} />

      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/registro"
          element={
            <PublicOnly>
              <RegisterPage />
            </PublicOnly>
          }
        />
        <Route
          path="/recuperar-usuario"
          element={
            <PublicOnly>
              <ForgotUserPage />
            </PublicOnly>
          }
        />
        <Route
          path="/recuperar-contrasena"
          element={
            <PublicOnly>
              <ForgotPasswordPage />
            </PublicOnly>
          }
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/billetera" element={<WalletPage />} />
          <Route path="/historial" element={<HistoryPage />} />
          <Route path="/transferir" element={<TransferPage />} />
          <Route path="/transferir/:transferId" element={<TransferReceiptPage />} />
          <Route path="/cuenta" element={<AccountPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
