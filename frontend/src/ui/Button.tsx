import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../shared/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "inverse"
  | "accent";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-bill text-white border border-bill hover:bg-bill-deep hover:border-bill-deep active:translate-y-px",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-paper-deep active:translate-y-px",
  ghost:
    "bg-transparent text-ink-soft border border-transparent hover:bg-paper-deep hover:text-ink",
  danger:
    "bg-danger text-white border border-danger hover:bg-[#932e23] hover:border-[#932e23] active:translate-y-px",
  inverse:
    "bg-white/10 text-white border border-white/15 hover:bg-white/15 hover:border-white/25",
  accent:
    "bg-[#6fd0ae] text-sidebar border border-[#6fd0ae] hover:bg-[#8de3c5] hover:border-[#8de3c5] active:translate-y-px",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center font-medium transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn(
        "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
    />
  );
}
