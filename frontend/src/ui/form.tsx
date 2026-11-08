import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../shared/cn";
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from "./icons";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
        </label>
        {optional ? (
          <span className="text-xs text-ink-muted">Opcional</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs leading-5 text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border bg-surface px-3.5 text-[15px] text-ink",
        "placeholder:text-ink-muted/70 transition-colors",
        "focus:border-bill focus:outline-none focus:ring-3 focus:ring-bill/15",
        invalid
          ? "border-danger focus:border-danger focus:ring-danger/15"
          : "border-line-strong",
        "disabled:cursor-not-allowed disabled:bg-paper-deep disabled:text-ink-muted",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  invalid?: boolean;
}

export function PasswordInput({
  className,
  invalid,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        invalid={invalid}
        className={cn("pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-ink-muted hover:text-ink"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-xl border bg-surface px-3.5 pr-10 text-[15px] text-ink",
          "transition-colors focus:border-bill focus:outline-none focus:ring-3 focus:ring-bill/15",
          invalid
            ? "border-danger focus:border-danger focus:ring-danger/15"
            : "border-line-strong",
          "disabled:cursor-not-allowed disabled:bg-paper-deep disabled:text-ink-muted",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-xl border bg-surface px-3.5 py-3 text-[15px] text-ink",
        "placeholder:text-ink-muted/70 transition-colors",
        "focus:border-bill focus:outline-none focus:ring-3 focus:ring-bill/15",
        invalid
          ? "border-danger focus:border-danger focus:ring-danger/15"
          : "border-line-strong",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function useFieldIds() {
  const id = useId();
  return {
    inputId: `${id}-input`,
    errorId: `${id}-error`,
  };
}
