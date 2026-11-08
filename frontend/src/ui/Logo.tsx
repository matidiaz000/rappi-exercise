import { cn } from "../shared/cn";

interface LogoProps {
  tone?: "ink" | "light";
  compact?: boolean;
  className?: string;
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("size-9", className)}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="currentColor" />
      <path
        d="M14 26c7-8 13-8 20 0s13 8 20 0"
        fill="none"
        stroke="#d8ebe1"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M14 39c7-8 13-8 20 0s13 8 20 0"
        fill="none"
        stroke="#2ea080"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ tone = "ink", compact = false, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark
        className={cn(
          "text-sidebar",
          tone === "light" && "text-sidebar-soft ring-1 ring-white/15",
        )}
      />
      {compact ? null : (
        <span
          className={cn(
            "font-display text-[1.45rem] font-semibold leading-none tracking-tight",
            tone === "light" ? "text-white" : "text-ink",
          )}
        >
          cauce
          <span className={tone === "light" ? "text-[#6fd0ae]" : "text-bill"}>
            .
          </span>
        </span>
      )}
    </span>
  );
}
