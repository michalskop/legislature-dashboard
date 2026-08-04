// PLACEHOLDER party display metadata for the generic scaffold (task A1).
//
// @legislature/ui's PartyBadge/PartyFace/SortableMpTable hardcode
// CZ_PSP_PARTY_META/COLORS and SK_NRSR_PARTY_META/COLORS directly (not a
// generic lookup — see DIVERGENCE.md). Rather than add a third hardcoded
// dictionary to that shared package (out of scope for A1 — packages/* are
// read-only for this task), this app defines its own local placeholder
// dictionary and uses it directly in the chart components that need JS-level
// colors (AttendanceSwarmChart, MpMetricSwarmChart, WpcaScatterChart,
// vote-event page). PartyFace/PartyBadge from @legislature/ui will not
// recognize these IDs and will fall back to a grey swatch + uppercased ID —
// that's expected and will be replaced with real city branding in A3.
export const PLACEHOLDER_PARTY_META: Record<
  string,
  { shortName: string; faceAbbr: string; darkText?: true }
> = {
  "placeholder-a": { shortName: "Klub A", faceAbbr: "A" },
  "placeholder-b": { shortName: "Klub B", faceAbbr: "B" },
  "placeholder-c": { shortName: "Klub C", faceAbbr: "C", darkText: true },
  other: { shortName: "Jiní", faceAbbr: "Jiní", darkText: true },
};

export const PLACEHOLDER_PARTY_COLORS: Record<string, string> = {
  "placeholder-a": "#2b6cb0",
  "placeholder-b": "#b7412f",
  "placeholder-c": "#d9a441",
  other: "#bcbcb0",
};
