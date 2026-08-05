/**
 * CityLogotype — generic network wordmark for Města.DataTimes.cz (task A1).
 *
 * Renders as: Města.DataTimes.cz (per plan.md D1: mesta.datatimes.cz/<city>).
 * This is a generic wordmark, not any specific city's branding — real
 * per-city logotypes/branding are task A3.
 *   color  — "Města" in brand-6, dots in yellow-7, "DataTimes.cz" in navy-9
 *   mono   — everything in a single `color` (dots at 0.6 opacity)
 */

import { palette } from "@legislature/ui";

export interface CityLogotypeProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  variant?: "color" | "dark" | "mono";
  /** CSS color for mono variant. Defaults to currentColor. */
  color?: string;
  renderMode?: "class" | "inline";
  className?: string;
}

const SIZE: Record<NonNullable<CityLogotypeProps["size"]>, string> = {
  xs: "text-xs",
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
  xxl: "text-8xl",
};

const INLINE_FONT_SIZE: Record<NonNullable<CityLogotypeProps["size"]>, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 36,
  xl: 60,
  xxl: 96,
};

export function CityLogotype({
  size = "md",
  variant = "color",
  color = "currentColor",
  renderMode = "class",
  className = "",
}: CityLogotypeProps) {
  const base = `font-bold tracking-tight ${SIZE[size]} ${className}`;
  const inlineTypography =
    renderMode === "inline"
      ? {
          fontSize: INLINE_FONT_SIZE[size],
          fontWeight: 700,
          letterSpacing: "-0.025em",
          lineHeight: 1,
        }
      : undefined;

  if (variant === "mono") {
    return (
      <span className={base} style={inlineTypography ? { ...inlineTypography, color } : { color }}>
        Města
        <span style={{ opacity: 0.6 }}>.</span>
        DataTimes
        <span style={{ opacity: 0.6 }}>.</span>
        cz
      </span>
    );
  }

  if (renderMode === "inline") {
    if (variant === "dark") {
      return (
        <span className={base} style={inlineTypography}>
          <span style={{ color: palette.brand6 }}>Města</span>
          <span style={{ color: palette.yellow7 }}>.</span>
          <span style={{ color: palette.navy0 }}>DataTimes</span>
          <span style={{ color: palette.yellow7 }}>.</span>
          <span style={{ color: palette.navy0 }}>cz</span>
        </span>
      );
    }

    return (
      <span className={base} style={inlineTypography}>
        <span style={{ color: palette.brand6 }}>Města</span>
        <span style={{ color: palette.yellow7 }}>.</span>
        <span style={{ color: palette.navy9 }}>DataTimes</span>
        <span style={{ color: palette.yellow7 }}>.</span>
        <span style={{ color: palette.navy9 }}>cz</span>
      </span>
    );
  }

  if (variant === "dark") {
    return (
      <span className={base}>
        <span className="text-brand-6">Města</span>
        <span className="text-yellow-7">.</span>
        <span className="text-surface-1">DataTimes</span>
        <span className="text-yellow-7">.</span>
        <span className="text-surface-1">cz</span>
      </span>
    );
  }

  return (
    <span className={base}>
      <span className="text-brand-6">Města</span>
      <span className="text-yellow-7">.</span>
      <span className="text-navy-9">DataTimes</span>
      <span className="text-yellow-7">.</span>
      <span className="text-navy-9">cz</span>
    </span>
  );
}
