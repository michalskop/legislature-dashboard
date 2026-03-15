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
