import type { CSSProperties } from "react";

export type PartyBadgeSize = "sm" | "md" | "lg";

export interface PartyBadgeProps {
  /** Party ID matching a --color-party-* token (e.g. "ano", "spd") */
  partyId: string;
  /** Override display label. Pass "" for color-block-only (no text). */
  label?: string;
  size?: PartyBadgeSize;
  className?: string;
}

/** Visual display metadata for Czech PSP 2025 parties */
export const CZ_PSP_PARTY_META: Record<
  string,
  { shortName: string; faceAbbr: string; darkText?: true }
> = {
  ano:       { shortName: "ANO",       faceAbbr: "ANO" },
  ods:       { shortName: "ODS",       faceAbbr: "ODS" },
  spolu:     { shortName: "SPOLU",     faceAbbr: "Spolu" },
  kdu:       { shortName: "KDU-ČSL",  faceAbbr: "KDU",  darkText: true },
  top09:     { shortName: "TOP 09",    faceAbbr: "TOP" },
  pirati:    { shortName: "Piráti",    faceAbbr: "Pir" },
  stan:      { shortName: "STAN",      faceAbbr: "STAN" },
  spd:       { shortName: "SPD",       faceAbbr: "SPD" },
  motoriste: { shortName: "Motoristé", faceAbbr: "Moto" },
  prisaha:   { shortName: "Přísaha",   faceAbbr: "Přís" },
  szs:       { shortName: "SZŠ",       faceAbbr: "SZŠ",  darkText: true },
  other:     { shortName: "Jiní",      faceAbbr: "Jiní", darkText: true },
};

/** Visual display metadata for Slovak NRSR 2023 parties */
export const SK_NRSR_PARTY_META: Record<
  string,
  { shortName: string; faceAbbr: string; darkText?: true }
> = {
  smer:      { shortName: "SMER",      faceAbbr: "SMER" },
  hlas:      { shortName: "HLAS",      faceAbbr: "HLAS" },
  ps:        { shortName: "PS",        faceAbbr: "PS",   darkText: true },
  slovensko: { shortName: "SLOVENSKO", faceAbbr: "SLOV" },
  kdh:       { shortName: "KDH",       faceAbbr: "KDH" },
  sas:       { shortName: "SaS",       faceAbbr: "SaS",  darkText: true },
  sns:       { shortName: "SNS",       faceAbbr: "SNS" },
};

/** Hex colors for Slovak NRSR 2023 parties */
export const SK_NRSR_PARTY_COLORS: Record<string, string> = {
  smer:      "#d82222",
  hlas:      "#e4007c",
  ps:        "#00bdff",
  slovensko: "#f97316",
  kdh:       "#173a70",
  sas:       "#9bc31c",
  sns:       "#253a79",
};

/** Hex colors matching --color-party-* CSS variables */
export const CZ_PSP_PARTY_COLORS: Record<string, string> = {
  ano:       "#272a59",
  kdu:       "#ffcf02",
  motoriste: "#1a9fbd",
  ods:       "#5e66d5",
  pirati:    "#111111",
  stan:      "#ff1a4a",
  spd:       "#a47d03",
  top09:     "#812840",
  prisaha:   "#a9b5f0",
  szs:       "#639e0a",
  other:     "#bcbcb0",
};

const sizeClasses: Record<PartyBadgeSize, string> = {
  sm: "text-[10px] leading-none px-1.5 py-0.5 rounded-badge-sm",
  md: "text-xs px-2.5 py-1 rounded-badge",
  lg: "text-sm px-3.5 py-1.5 rounded-badge-lg",
};

export function PartyBadge({
  partyId,
  label,
  size = "md",
  className = "",
}: PartyBadgeProps) {
  const meta = CZ_PSP_PARTY_META[partyId] ?? SK_NRSR_PARTY_META[partyId];
  const displayLabel =
    label !== undefined ? label : (meta?.shortName ?? partyId.toUpperCase());
  const darkText = meta?.darkText ?? false;

  const style: CSSProperties = {
    backgroundColor: `var(--color-party-${partyId})`,
    color: darkText ? "var(--color-foreground)" : "#ffffff",
  };

  return (
    <span
      className={[
        "inline-flex items-center font-sans font-semibold tracking-wide",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {displayLabel}
    </span>
  );
}
