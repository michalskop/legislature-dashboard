/**
 * SnemovnaLogotype — logotype for snemovna.datatimes.cz
 *
 * Renders as: Sněmovna.DataTimes.cz
 *   color  — "Sněmovna" in brand-6, dots in yellow-7, "DataTimes.cz" in navy-9
 *   mono   — everything in a single `color` (dots at 0.6 opacity)
 */

export interface SnemovnaLogotypeProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "color" | "mono";
  /** CSS color for mono variant. Defaults to currentColor. */
  color?: string;
  className?: string;
}

const SIZE: Record<NonNullable<SnemovnaLogotypeProps["size"]>, string> = {
  xs: "text-xs",
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

export function SnemovnaLogotype({
  size = "md",
  variant = "color",
  color = "currentColor",
  className = "",
}: SnemovnaLogotypeProps) {
  const base = `font-bold tracking-tight ${SIZE[size]} ${className}`;

  if (variant === "mono") {
    return (
      <span className={base} style={{ color }}>
        Sněmovna
        <span style={{ opacity: 0.6 }}>.</span>
        DataTimes
        <span style={{ opacity: 0.6 }}>.</span>
        cz
      </span>
    );
  }

  return (
    <span className={base}>
      <span className="text-brand-6">Sněmovna</span>
      <span className="text-yellow-7">.</span>
      <span className="text-navy-9">DataTimes</span>
      <span className="text-yellow-7">.</span>
      <span className="text-navy-9">cz</span>
    </span>
  );
}
