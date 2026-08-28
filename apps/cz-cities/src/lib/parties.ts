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
//
// Sourcing per party (Ostrava 2022 candidate lists, added 2026-08-27):
//   - kdu-csl                  -> Snemovna's KDU-ČSL color (#ffcf02, darkText)
//     — unlike Brno's "Lidovci a Starostové" joint list, Ostrava's vote-page
//     data shows KDU-ČSL as its own standalone registered klub (a separate
//     `<th>` header from "ODS + TOP09"), confirmed directly from primary
//     data — see ostrava/scripts/party_affiliation.py in the city data repo.
//   - ods-top09                -> Snemovna's ODS color (#5e66d5) — same
//     treatment as Praha's spolu-pro-prahu / Brno's ods-a-top-09 (ODS is the
//     lead party of "Koalice SPOLU (ODS, KDU-ČSL, TOP 09)").
//   - spd                      -> Snemovna's SPD color (#a47d03) — Ostrava's
//     "SPD" is its own standalone klub (unlike Praha/Brno's SPD+Trikolora
//     joint lists), so no "lead party" reasoning needed, direct reuse.
//   - starostove-pro-ostravu   -> Snemovna's STAN color (#ff1a4a) — Czech
//     Wikipedia's own 2022 Ostrava election results table glosses this list
//     as "STAROSTOVÉ pro OSTRAVU (tj. STAN a nezávislí kandidáti)" ("i.e.
//     STAN and independent candidates"), confirming the STAN affiliation
//     directly; same treatment as Praha's starostove-a-nezavisli.
//   - ano-2011 / pirati        -> same key/color as Praha/Brno (same real
//     parties).
//   - ostravak                 -> NOT in Snemovna (a local/regional
//     movement, no national-level equivalent) — sourced from the color
//     swatch in Czech Wikipedia's own 2022 Ostrava election results table
//     (cs.wikipedia.org/wiki/Volby_do_Zastupitelstva_města_Ostravy_2022),
//     verified in the raw page HTML (`style="background-color:#8b0000"` next
//     to the "Ostravak" row).
//   - ostravska-levice         -> NOT in Snemovna (a local coalition, KSČM +
//     nezávislí kandidáti) — sourced the same way, from the same Wikipedia
//     table (`style="background-color:#bf0202"` next to "OSTRAVSKÁ LEVICE").
//     A visually distinct red from Brno's cssd-vasi-starostove (#E63636)
//     despite both being reds — different real parties, kept independently
//     sourced rather than assumed to match.
//   - nezarazeni                -> reuses the SAME key already added for
//     Brno (same "unaffiliated" semantic — this genuinely is the identical
//     concept, not just a coincidentally-matching slug).
//   - jdeto                     -> shortName/faceAbbr added (its real name),
//     but DELIBERATELY NO COLOR, same reasoning as Brno's "nezavisli"/"brno
//     klidem" entries: "JDETO!!!" is a 2023 mid-term movement (see the city
//     data repo's ostrava/scripts/party_affiliation.py for the dated
//     evidence of its formation after the ANO 2011 club split), not a 2022
//     election-list party, so neither Snemovna reuse nor the 2022 Wikipedia
//     election page apply. Ask the project owner if/when this needs a real
//     brand color; falls through to the generic gray until then.
//
// Sourcing per party (Most 2022 election lists, added 2026-08-28):
//   - ano-2011              -> same key/color as Praha/Brno/Ostrava (same
//     real party). Most's own Wikipedia infobox legend shows a different
//     hex (#2f2f65) for its local ANO 2011 list color, NOT used here — same
//     "same real party, same color across cities" convention already
//     established (see Brno's ods-a-top-09 note above for the precedent of
//     preferring Snemovna reuse over an available city-specific swatch).
//   - spd-s-pod-trik        -> Snemovna's SPD color (#a47d03) — SPD is the
//     lead party of "SPD s podporou Trikolóry", same lead-party treatment
//     as Praha/Brno/Ostrava's other SPD-led joint lists.
//   - ods-a-nezavisli       -> Snemovna's ODS color (#5e66d5) — ODS is the
//     lead party of "ODS a NEZÁVISLÍ", same treatment as Brno's
//     ods-a-top-09/Ostrava's ods-top09.
//   - promost               -> NOT in Snemovna (a local movement, "Pro
//     Most", no national-level equivalent) — sourced from Czech Wikipedia's
//     own Most city-council article's infobox legend
//     (cs.wikipedia.org/wiki/Zastupitelstvo_města_Mostu, raw wikitext
//     `{{legenda|#0079c0|[[ProMOST]]}}`).
//   - smm                   -> NOT in Snemovna (Sdružení Mostečané Mostu, a
//     local movement) — sourced the same way, from the same infobox legend
//     (`{{legenda|#19488e|...}}`).
//   - nezaraz               -> reuses the SAME neutral gray already used for
//     Brno/Ostrava's "nezarazeni" (identical "unaffiliated" semantic, just a
//     different real-data slug — Most's feed abbreviates the group name to
//     "Nezařaz."). Most's own Wikipedia legend shows a distinct light gray
//     (#DEDEDE) for its "Nezařazení" list color, not used here for the same
//     reason "nezarazeni" itself was never city-sourced: this is a
//     no-affiliation bucket, not a real party brand, so the existing
//     generic neutral color applies directly.
//
// Sourcing per party (Plzeň 2022 election lists, added 2026-08-28):
//   - ano-2011-a-nezavisli   -> Snemovna's ANO color (#272a59) — same real
//     party as every other city's "ano-2011" key, just a different slug here
//     since Plzeň's own klub label includes "a nezávislí".
//   - ceska-piratska-strana  -> reuses the EXISTING key/color already added
//     for Praha (#111111, Snemovna's Piráti color) — same slug, no new entry
//     needed.
//   - kdu-csl / spd          -> reuse the EXISTING keys/colors already added
//     for Ostrava (#ffcf02 darkText / #a47d03) — same slugs, no new entries
//     needed.
//   - stan                   -> Snemovna's STAN color (#ff1a4a) — Plzeň's own
//     slug is plain "stan" (not "starostove-a-nezavisli"/"starostove-pro-
//     ostravu" like Praha/Ostrava use), so it needs its OWN entry despite
//     being the same real party — PARTY_COLORS is an exact-match lookup, not
//     a fuzzy alias resolver (caught via a local dev-server visual check
//     showing STAN falling back to gray before this entry was added).
//   - ods                    -> Snemovna's ODS color (#5e66d5) — Plzeň's ODS
//     is its own standalone klub (unlike Praha/Brno's joint SPOLU-style
//     lists), direct reuse, same treatment as Ostrava's "ods-top09".
//   - ods-kdu-csl-top-09     -> the term's ORIGINAL (2022-2024) joint "Spolu"
//     list, before it split into 3 separate klubs (see the city data repo's
//     plzen/scripts/party_affiliation.py for the confirmed 9/3/3 real split,
//     not a mere relabeling) — reuses ODS's color, ODS being the lead party
//     of the list, same lead-party convention as every other city's joint
//     SPOLU/coalition lists.
//   - top-09                 -> Snemovna's TOP 09 color (#812840,
//     packages/ui's CZ_PSP_PARTY_COLORS) — Plzeň's TOP 09 is its own
//     standalone klub from 2024 onward (after the Spolu list's real split).
//   - pro-plzen              -> NOT in Snemovna (a local movement, no
//     national-level equivalent) — no dedicated Wikipedia election-results
//     page exists for Plzeň's 2022 council election (checked 2026-08-28,
//     unlike every prior city). shortName/faceAbbr added (its real name),
//     but DELIBERATELY NO COLOR per rule 3 above ("never invent a color") —
//     same treatment as Ostrava's "jdeto"/Brno's "nezavisli". Ask the
//     project owner if/when this needs a real brand color; falls through to
//     the generic gray until then.
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
  "kdu-csl": { shortName: "KDU-ČSL", faceAbbr: "KDU", darkText: true },
  "ods-top09": { shortName: "ODS + TOP09", faceAbbr: "ODS" },
  spd: { shortName: "SPD", faceAbbr: "SPD" },
  "starostove-pro-ostravu": { shortName: "STAN", faceAbbr: "STAN" },
  ostravak: { shortName: "Ostravak", faceAbbr: "OSTA" },
  "ostravska-levice": { shortName: "Ostravská levice", faceAbbr: "OLE" },
  jdeto: { shortName: "JDETO!!!", faceAbbr: "JDT", darkText: true },
  "spd-s-pod-trik": { shortName: "SPD a další", faceAbbr: "SPD" },
  "ods-a-nezavisli": { shortName: "ODS a nezávislí", faceAbbr: "ODS" },
  promost: { shortName: "ProMOST", faceAbbr: "PM" },
  smm: { shortName: "SMM", faceAbbr: "SMM" },
  nezaraz: { shortName: "Nezařazení", faceAbbr: "NEZ", darkText: true },
  "ano-2011-a-nezavisli": { shortName: "ANO", faceAbbr: "ANO" },
  ods: { shortName: "ODS", faceAbbr: "ODS" },
  "ods-kdu-csl-top-09": { shortName: "Spolu", faceAbbr: "SPOLU" },
  "top-09": { shortName: "TOP 09", faceAbbr: "TOP" },
  "pro-plzen": { shortName: "PRO PLZEŇ", faceAbbr: "PP" },
  stan: { shortName: "STAN", faceAbbr: "STAN" },
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
  "kdu-csl": "#ffcf02",
  "ods-top09": "#5e66d5",
  spd: "#a47d03",
  "starostove-pro-ostravu": "#ff1a4a",
  ostravak: "#8b0000",
  "ostravska-levice": "#bf0202",
  "spd-s-pod-trik": "#a47d03",
  "ods-a-nezavisli": "#5e66d5",
  promost: "#0079c0",
  smm: "#19488e",
  nezaraz: "#bcbcb0",
  "ano-2011-a-nezavisli": "#272a59",
  ods: "#5e66d5",
  "ods-kdu-csl-top-09": "#5e66d5",
  "top-09": "#812840",
  stan: "#ff1a4a",
  other: "#bcbcb0",
};
