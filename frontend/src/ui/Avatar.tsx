import { cn } from "../shared/cn";
import { getInitials } from "../domain/contacts/contacts";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
};

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full bg-bill-soft font-semibold text-bill-deep ring-1 ring-bill/15",
        SIZES[size],
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name) || "?"}
    </span>
  );
}
