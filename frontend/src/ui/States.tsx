import type { ReactNode } from "react";
import { cn } from "../shared/cn";
import {
  AlertTriangleIcon,
  InfoIcon,
  RefreshIcon,
  ShieldIcon,
  CheckIcon,
} from "./icons";
import { Button } from "./Button";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-paper-deep", className)}
      aria-hidden="true"
    />
  );
}

export function PageLoader({ label = "Cargando…" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-20 text-ink-muted"
      role="status"
      aria-live="polite"
    >
      <span className="size-7 animate-spin rounded-full border-2 border-line-strong border-r-transparent" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "No pudimos cargar la información",
  message,
  onRetry,
  retryLabel = "Reintentar",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border border-danger/25 bg-danger-soft/60 p-5",
        className,
      )}
      role="alert"
    >
      <div className="flex items-center gap-2 text-danger">
        <AlertTriangleIcon className="size-5" />
        <h2 className="font-display text-base font-semibold">{title}</h2>
      </div>
      <p className="max-w-prose text-sm leading-6 text-ink-soft">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshIcon className="size-4" />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="grid size-11 place-items-center rounded-full bg-paper-deep text-ink-soft">
          {icon}
        </div>
      ) : null}
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="max-w-sm text-sm leading-6 text-ink-muted">{message}</p>
      {action}
    </div>
  );
}

export type NoticeTone = "info" | "success" | "warning" | "danger";

const NOTICE_STYLES: Record<NoticeTone, string> = {
  info: "border-line-strong bg-paper-deep/60 text-ink-soft",
  success: "border-[#b9d9c8] bg-bill-soft/70 text-bill-deep",
  warning: "border-[#e2cb93] bg-pending-soft/70 text-[#6f4d07]",
  danger: "border-[#e8c1b9] bg-danger-soft/70 text-danger",
};

const NOTICE_ICONS: Record<NoticeTone, ReactNode> = {
  info: <InfoIcon className="size-4" />,
  success: <CheckIcon className="size-4" />,
  warning: <AlertTriangleIcon className="size-4" />,
  danger: <AlertTriangleIcon className="size-4" />,
};

interface InlineNoticeProps {
  tone?: NoticeTone;
  children: ReactNode;
  icon?: ReactNode | false;
  className?: string;
}

export function InlineNotice({
  tone = "info",
  children,
  icon,
  className,
}: InlineNoticeProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-6",
        NOTICE_STYLES[tone],
        className,
      )}
      role={tone === "danger" ? "alert" : undefined}
    >
      {icon === false ? null : (
        <span className="mt-0.5 shrink-0">{icon ?? NOTICE_ICONS[tone]}</span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function SecurityNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-line bg-paper-deep/50 px-3.5 py-3 text-xs leading-5 text-ink-muted">
      <ShieldIcon className="mt-0.5 size-4 shrink-0 text-ink-soft" />
      <p>{children}</p>
    </div>
  );
}
