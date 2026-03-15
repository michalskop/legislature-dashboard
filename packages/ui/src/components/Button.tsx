import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90",
  secondary:
    "bg-surface-3 text-foreground hover:bg-surface-4",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-3",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 rounded-badge-sm",
  md: "text-sm px-4 py-2 rounded-badge",
  lg: "text-base px-6 py-2.5 rounded-badge-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center font-semibold transition-opacity disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
