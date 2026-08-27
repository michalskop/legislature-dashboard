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
//
// Sourcing per party (Brno 2022 candidate lists, added 2026-08-27):
//   - ods-a-top-09         -> Snemovna's ODS color (#5e66d5) — same treatment
//     as Praha's spolu-pro-prahu (ODS is the lead party of "SPOLEČNĚ – ODS a
//     TOP 09"); Wikipedia's own Brno-specific swatch for this list is
//     #034EA2, not used here to keep the "same real coalition family, same
//     color across cities" convention Praha already established.
//   - ano-2011             -> same key/color as Praha (same real party).
//   - pirati                -> Snemovna's Piráti color (#111111) — Brno's
//     Wikipedia swatch for "Česká pirátská strana" independently shows
//     #000000, consistent.
//   - lidovci-a-starostove -> Snemovna's KDU-ČSL color (#ffcf02, darkText) —
//     KDU-ČSL ("Lidovci") is the lead party of "Lidovci a Starostové" (list
//     leader Petr Hladík is a KDU-ČSL politician).
//   - spd-trikolora        -> Snemovna's SPD color (#a47d03) — SPD is the
//     lead party of "SPD, TRIKOLORA, MORAVANÉ a nezávislí", same treatment
//     as Praha's spd-trik-pes-a-nez-pro-prahu.
//   - cssd-vasi-starostove / socdem -> NOT in Snemovna (ČSSD holds no
//     Sněmovna seats) — sourced from the color swatch in Czech Wikipedia's
//     own 2022 Brno election results table
//     (cs.wikipedia.org/wiki/Volby_do_Zastupitelstva_města_Brna_2022),
//     verified in the raw page HTML (`style="background-color:#E63636"` next
//     to the "ČSSD VAŠI STAROSTOVÉ" row). Both slugs are the SAME real party
//     across its 2023 ČSSD->SOCDEM national rebrand (see
//     brno/analyses/govity/govity_definition.json's government_groups_citation
//     in the city data repo) — same color for both, for visual continuity.
//   - zeleni-a-zit-brno    -> NOT reused from Snemovna's "szs" entry
//     (uncertain whether that's the same real Green Party entity) — sourced
//     from the Brno-specific Wikipedia swatch instead
//     (`style="background-color:#00AD43"` next to "Zelení a Žít Brno s
//     podporou Idealistů").
//   - nezarazeni           -> reuses the existing neutral "other" gray
//     (#bcbcb0, darkText) — this slug literally means "unaffiliated", not a
//     real party brand, so the existing no-affiliation color applies
//     directly rather than needing its own source.
//   - nezavisli / brno-klidem-a-nezavisli-zastupitele -> shortName/faceAbbr
//     added (their real names, already known from the source data — not
//     something that needs sourcing), but DELIBERATELY NO COLOR. Neither is
//     a real 2022 election-list party (both are 2026 mid-term relabelings of
//     the same ex-ANO 2011 group after their Dec 2025 expulsion — see the
//     city data repo's govity_definition.json), so neither Snemovna reuse
//     nor the 2022 Wikipedia election page apply, and "Brno klidem" is too
//     new to have an established brand color findable via the same method.
//     Per rule 3 above ("never invent a color"): ask the project owner for
//     these two specifically. Until then both fall through to the generic
//     gray (PARTY_COLORS lookups all end `?? "#bcbcb0"`) — readable label,
//     placeholder color, not a broken or silently-wrong one.
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
  "ods-a-top-09": { shortName: "ODS a TOP 09", faceAbbr: "ODS" },
  pirati: { shortName: "Piráti", faceAbbr: "PIR" },
  "lidovci-a-starostove": { shortName: "Lidovci a Starostové", faceAbbr: "KDU", darkText: true },
  "spd-trikolora": { shortName: "SPD a další", faceAbbr: "SPD" },
  "cssd-vasi-starostove": { shortName: "ČSSD", faceAbbr: "ČSSD" },
  socdem: { shortName: "SOCDEM", faceAbbr: "ČSSD" },
  "zeleni-a-zit-brno": { shortName: "Zelení", faceAbbr: "ZEL" },
  nezarazeni: { shortName: "Nezařazení", faceAbbr: "NEZ", darkText: true },
  nezavisli: { shortName: "Nezávislí", faceAbbr: "NEZ", darkText: true },
  "brno-klidem-a-nezavisli-zastupitele": { shortName: "Brno klidem", faceAbbr: "BK", darkText: true },
  other: { shortName: "Jiní", faceAbbr: "Jiní", darkText: true },
};

export const PARTY_COLORS: Record<string, string> = {
  "spolu-pro-prahu": "#5e66d5",
  "ceska-piratska-strana": "#111111",
  "starostove-a-nezavisli": "#ff1a4a",
  "ano-2011": "#272a59",
  "praha-sobe": "#FFF021",
  "spd-trik-pes-a-nez-pro-prahu": "#a47d03",
  "ods-a-top-09": "#5e66d5",
  pirati: "#111111",
  "lidovci-a-starostove": "#ffcf02",
  "spd-trikolora": "#a47d03",
  "cssd-vasi-starostove": "#E63636",
  socdem: "#E63636",
  "zeleni-a-zit-brno": "#00AD43",
  nezarazeni: "#bcbcb0",
  other: "#bcbcb0",
};
