/**
 * Format a number as a percentage string with Czech locale.
 * e.g. 0.8234 → "82,3 %"
 */
export function formatPercent(value: number, decimals = 1): string {
  return (
    (value * 100).toLocaleString("cs-CZ", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + "\u00a0%"
  );
}

/**
 * Format a ratio already expressed as a percentage (0–100).
 * e.g. 82.3 → "82,3 %"
 */
export function formatPercentRaw(value: number, decimals = 1): string {
  return (
    value.toLocaleString("cs-CZ", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + "\u00a0%"
  );
}

/**
 * Darken a hex color if its perceived brightness exceeds `maxBrightness` (0–1).
 * Uses the NTSC perceived-brightness formula. Leaves dark colors unchanged.
 * Intended for chart dots/lines where very light party colors become invisible
 * on a light background.
 *
 * e.g. KDU yellow #ffcf02 (brightness ~0.78) → darkened to ~0.65 → #d4ac01
 */
export function ensureChartContrast(
  hex: string,
  maxBrightness = 0.65,
  darkenStrength = 0.65,
): string {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (brightness <= maxBrightness) return hex;
  const strength = Math.min(1, Math.max(0, darkenStrength));
  const fullFactor = maxBrightness / brightness;
  const factor = 1 - (1 - fullFactor) * strength;
  const toHex = (v: number) => Math.round(v * factor).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Format a date as a human-readable relative string in Czech.
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "dnes";
  if (diffDays === 1) return "včera";
  if (diffDays < 7) return `před ${diffDays}\u00a0dny`;
  if (diffDays < 14) return "před týdnem";
  if (diffDays < 30) return `před ${Math.floor(diffDays / 7)}\u00a0týdny`;
  if (diffDays < 60) return "před měsícem";
  if (diffDays < 365) return `před ${Math.floor(diffDays / 30)}\u00a0měsíci`;
  return `před ${Math.floor(diffDays / 365)}\u00a0lety`;
}
