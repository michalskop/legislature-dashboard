// Party/group display metadata (colors, short names, face abbreviations).
//
// @legislature/ui's PartyBadge/PartyFace/SortableMpTable hardcode
// CZ_PSP_PARTY_META/COLORS and SK_NRSR_PARTY_META/COLORS directly (not a
// generic lookup — see DIVERGENCE.md, a T6 finding). This app defines its
// own dictionary and uses it directly wherever party color/abbreviation is
// needed at the JS level: the chart components (MpMetricSwarmChart,
// WpcaScatterChart), the vote-event page's buildGroups(), and (owner review
// fix, 2026-08-05 — see DIVERGENCE.md §6) the local PartyFace component used
// by the members table and every group/member detail page, so badges are
// visually identical everywhere in the app, not just in charts.
//
// Keys are the real Praha candidate-list slugs (see lib/groups.ts's
// groupIdToPartyId — real organization IDs already carry a unique slug, no
// separate mapping table needed).
//
// Colors below are REAL branding (owner review fix, 2026-08-05), not a
// functional placeholder palette — see DIVERGENCE.md §6/"Party color lookup
// rule" for the full methodology this app (and every future city) must
// follow:
//   1. Reuse Snemovna's color for the same party/coalition, if it exists
//      there — packages/ui/src/components/PartyBadge.tsx's
//      CZ_PSP_PARTY_COLORS is the source of truth (read-only, don't edit;
//      values are copied here, not re-derived).
//   2. Else, search Wikipedia's election-results page for that city/term for
//      an official color swatch — fetch the RAW page HTML (a text-only fetch
//      strips inline `style="background-color:#..."` attributes) and read
//      the swatch color directly from the table markup.
//   3. Else, ask the project owner. Never invent a color.
//
// Sourcing per party (Praha 2022 candidate lists):
//   - spolu-pro-prahu              -> Snemovna's SPOLU/ODS color (#5e66d5)
//   - ano-2011                     -> Snemovna's ANO color (#272a59)
//   - ceska-piratska-strana        -> Snemovna's Piráti color (#111111)
//   - starostove-a-nezavisli       -> Snemovna's STAN color (#ff1a4a)
//   - spd-trik-pes-a-nez-pro-prahu -> Snemovna's SPD color (#a47d03) — SPD is
//     the lead party of this list ("SPD,Trik.,PES a nez. pro Prahu")
//   - praha-sobe                   -> NOT in Snemovna (no national-level
//     equivalent) — sourced from the color swatch in Czech Wikipedia's own
//     2022 Prague election results table
//     (cs.wikipedia.org/wiki/Volby_do_Zastupitelstva_hlavního_města_Prahy_2022),
//     verified in the raw page HTML (`style="background-color:#FFF021"` next
//     to the PRAHA SOBĚ row). Bright yellow — needs `darkText: true`, same
//     treatment as Snemovna's KDU-ČSL (#ffcf02, also `darkText: true`).
export const PARTY_META: Record<
  string,
  { shortName: string; faceAbbr: string; darkText?: true }
> = {
  "spolu-pro-prahu": { shortName: "SPOLU", faceAbbr: "SPOLU" },
  "ceska-piratska-strana": { shortName: "Piráti", faceAbbr: "PIR" },
  "starostove-a-nezavisli": { shortName: "STAN", faceAbbr: "STAN" },
  "ano-2011": { shortName: "ANO", faceAbbr: "ANO" },
  "praha-sobe": { shortName: "Praha sobě", faceAbbr: "PS", darkText: true },
  "spd-trik-pes-a-nez-pro-prahu": { shortName: "SPD a další", faceAbbr: "SPD" },
  other: { shortName: "Jiní", faceAbbr: "Jiní", darkText: true },
};

export const PARTY_COLORS: Record<string, string> = {
  "spolu-pro-prahu": "#5e66d5",
  "ceska-piratska-strana": "#111111",
  "starostove-a-nezavisli": "#ff1a4a",
  "ano-2011": "#272a59",
  "praha-sobe": "#FFF021",
  "spd-trik-pes-a-nez-pro-prahu": "#a47d03",
  other: "#bcbcb0",
};
