// Party/group display metadata (colors, short names, face abbreviations).
//
// @legislature/ui's PartyBadge/PartyFace/SortableMpTable hardcode
// CZ_PSP_PARTY_META/COLORS and SK_NRSR_PARTY_META/COLORS directly (not a
// generic lookup — see DIVERGENCE.md, a T6 finding). This app defines its
// own dictionary and uses it directly in the chart components that need
// JS-level colors (AttendanceSwarmChart, MpMetricSwarmChart, WpcaScatterChart,
// vote-event page). PartyFace/PartyBadge from @legislature/ui don't
// recognize these IDs and fall back to a grey swatch + uppercased ID.
//
// Keys are the real Praha candidate-list slugs (see lib/groups.ts's
// groupIdToPartyId — real organization IDs already carry a unique slug, no
// separate mapping table needed). Colors here are a functional, distinct
// palette, NOT official party branding — real per-city branding is task A3
// ("City branding + translations", plan.md Wave 2). Keeping this file keyed
// by real IDs (rather than "placeholder-a/b/c") is itself part of A2: it
// proves the same lookup mechanism works unchanged once real IDs replace
// placeholder ones.
export const PARTY_META: Record<
  string,
  { shortName: string; faceAbbr: string; darkText?: true }
> = {
  "spolu-pro-prahu": { shortName: "SPOLU", faceAbbr: "SPOLU" },
  "ceska-piratska-strana": { shortName: "Piráti", faceAbbr: "PIR" },
  "starostove-a-nezavisli": { shortName: "STAN", faceAbbr: "STAN" },
  "ano-2011": { shortName: "ANO", faceAbbr: "ANO", darkText: true },
  "praha-sobe": { shortName: "Praha sobě", faceAbbr: "PS" },
  "spd-trik-pes-a-nez-pro-prahu": { shortName: "SPD a další", faceAbbr: "SPD", darkText: true },
  other: { shortName: "Jiní", faceAbbr: "Jiní", darkText: true },
};

export const PARTY_COLORS: Record<string, string> = {
  "spolu-pro-prahu": "#0047ab",
  "ceska-piratska-strana": "#000000",
  "starostove-a-nezavisli": "#f39200",
  "ano-2011": "#f4c400",
  "praha-sobe": "#7a1fa2",
  "spd-trik-pes-a-nez-pro-prahu": "#8b3a3a",
  other: "#bcbcb0",
};
