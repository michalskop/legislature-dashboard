/**
 * NrsrLogotype — logotype for nrsr.datatimes.sk
 *
 * Renders as: NRSR.DataTimes.sk
 *   color  — "NRSR" in brand-6, dots in yellow-7, "DataTimes.sk" in navy-9
 *   mono   — everything in a single `color` (dots at 0.6 opacity)
 */

import { palette } from "@legislature/ui";

export interface NrsrLogotypeProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  variant?: "color" | "dark" | "mono";
  /** CSS color for mono variant. Defaults to currentColor. */
  color?: string;
  renderMode?: "class" | "inline";
  className?: string;
}

const SIZE: Record<NonNullable<NrsrLogotypeProps["size"]>, string> = {
  xs: "text-xs",
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
  xxl: "text-8xl",
};

const INLINE_FONT_SIZE: Record<NonNullable<NrsrLogotypeProps["size"]>, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 36,
  xl: 60,
  xxl: 96,
};

export function NrsrLogotype({
  size = "md",
  variant = "color",
  color = "currentColor",
  renderMode = "class",
  className = "",
}: NrsrLogotypeProps) {
  const base = `font-bold tracking-tight ${SIZE[size]} ${className}`;
  const inlineTypography =
    renderMode === "inline"
      ? {
          fontSize: INLINE_FONT_SIZE[size],
          fontWeight: 700,
          letterSpacing: "-0.025em",
        }
      : undefined;

  if (variant === "mono") {
    return (
      <span className={base} style={inlineTypography ? { ...inlineTypography, color } : { color }}>
        NRSR
        <span style={{ opacity: 0.6 }}>.</span>
        DataTimes
        <span style={{ opacity: 0.6 }}>.</span>
        sk
      </span>
    );
  }

  if (renderMode === "inline") {
    if (variant === "dark") {
      return (
        <span className={base} style={inlineTypography}>
          <span style={{ color: palette.brand6 }}>NRSR</span>
          <span style={{ color: palette.yellow7 }}>.</span>
          <span style={{ color: palette.navy0 }}>DataTimes</span>
          <span style={{ color: palette.yellow7 }}>.</span>
          <span style={{ color: palette.navy0 }}>sk</span>
        </span>
      );
    }

    return (
      <span className={base} style={inlineTypography}>
        <span style={{ color: palette.brand6 }}>NRSR</span>
        <span style={{ color: palette.yellow7 }}>.</span>
        <span style={{ color: palette.navy9 }}>DataTimes</span>
        <span style={{ color: palette.yellow7 }}>.</span>
        <span style={{ color: palette.navy9 }}>sk</span>
      </span>
    );
  }

  if (variant === "dark") {
    return (
      <span className={base}>
        <span className="text-brand-6">NRSR</span>
        <span className="text-yellow-7">.</span>
        <span className="text-surface-1">DataTimes</span>
        <span className="text-yellow-7">.</span>
        <span className="text-surface-1">sk</span>
      </span>
    );
  }

  return (
    <span className={base}>
      <span className="text-brand-6">NRSR</span>
      <span className="text-yellow-7">.</span>
      <span className="text-navy-9">DataTimes</span>
      <span className="text-yellow-7">.</span>
      <span className="text-navy-9">sk</span>
    </span>
  );
}
