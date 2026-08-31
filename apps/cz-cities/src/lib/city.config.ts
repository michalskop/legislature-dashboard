import type { ParliamentConfig, ParliamentTranslations } from "@legislature/parliament-core";
import { prahaCs } from "./dictionaries/praha.cs";
import { prahaEn } from "./dictionaries/praha.en";
import { brnoCs } from "./dictionaries/brno.cs";
import { brnoEn } from "./dictionaries/brno.en";
import { ostravaCs } from "./dictionaries/ostrava.cs";
import { ostravaEn } from "./dictionaries/ostrava.en";
import { mostCs } from "./dictionaries/most.cs";
import { mostEn } from "./dictionaries/most.en";
import { plzenCs } from "./dictionaries/plzen.cs";
import { plzenEn } from "./dictionaries/plzen.en";
import { mostRadaCs } from "./dictionaries/most-rada.cs";
import { mostRadaEn } from "./dictionaries/most-rada.en";
import { ustiNadLabemCs } from "./dictionaries/usti-nad-labem.cs";
import { ustiNadLabemEn } from "./dictionaries/usti-nad-labem.en";
import { hradecKraloveCs } from "./dictionaries/hradec-kralove.cs";
import { hradecKraloveEn } from "./dictionaries/hradec-kralove.en";
import { pardubiceCs } from "./dictionaries/pardubice.cs";
import { pardubiceEn } from "./dictionaries/pardubice.en";

// Owner fix (2026-08-05, DIVERGENCE.md §8 round 4): the shared
// ParliamentTranslations.charts.wpca (packages/parliament-core, read-only)
// only has room for a fixed { xLabel, yLabel } pair — it assumes x is always
// the coalition/opposition axis and y is always the neutral one, which cz-psp
// and sk-nrsr can get away with but cz-cities can't (x/y are fixed at
// dims[0]/dims[1] regardless of which one is actually government, per the
// round-3 reversal, so the label text has to vary by sign at runtime, not
// just by which axis it's on). Rather than edit the shared package (a bigger,
// cross-app change needing its own review), redefine `charts.wpca` locally
// with the 3 strings this app actually needs, keeping every other field of
// ParliamentTranslations untouched.
export type CityTranslations = Omit<ParliamentTranslations, "charts"> & {
  charts: {
    average: string;
    wpca: {
      govAxisLabelPositive: string;
      govAxisLabelNegative: string;
      otherAxisLabel: string;
    };
  };
};

// ─────────────────────────────────────────────────────────────────────────
// Multi-city config — task A2 (plan.md D5/A2, replaces A1's single hardcoded
// `parliamentConfig`).
//
// `ParliamentConfig` (from @legislature/parliament-core, read-only package)
// is inherently single-parliament-shaped — it has no notion of "which city".
// `CityConfig` composes it with a `citySlug` (the URL segment, e.g. "praha")
// and this file is the ONE place that lists which cities exist. Adding a
// second real city (Brno, once C2-C5 land — see plan.md Wave 3) is meant to
// be "append one CityConfig object to CITIES" — no route file, no component,
// and no middleware code should hardcode "praha" as if it were the only
// possible value. `getCityConfig`/`getCitySlugs` below are the only way
// route code should look up a city; `generateStaticParams` in
// src/app/[lang]/[city]/layout.tsx enumerates exactly this array.
//
// Praha, Brno and Ostrava are all populated (real data, owner sign-off DONE
// 2026-08-04, 2026-08-27, and 2026-08-27 respectively).
// ─────────────────────────────────────────────────────────────────────────

export type CityConfig = Omit<ParliamentConfig, "translations"> & {
  /** URL segment for this city, e.g. "praha" -> /praha, /en/praha */
  citySlug: string;
  translations: Record<string, CityTranslations>;
};

const PRAHA: CityConfig = {
  id: "praha",
  citySlug: "praha",
  name: "Zastupitelstvo hlavního města Prahy",
  defaultLang: "cs",

  // The city data repo (cz-municipalities-votes-2022-2026, public, no B2)
  // commits both the four analysis outputs under
  // `<city>/analyses/<slug>/outputs/` and the raw standard tables under
  // `<city>/data/*.csv`. `dataBase` here points at the analyses root (same
  // convention apps/cz-psp already uses for its own `dataBase`);
  // src/lib/data.ts derives the sibling raw-tables URL from it and fetches
  // both live (real `fetch()` against raw.githubusercontent.com, swapped
  // 2026-08-27 from the original committed-local-fixtures approach — see
  // src/lib/data.ts's module doc for the fetchAnalysisJson/readCityCsv
  // implementation and git history for the pre-swap fixture version).
  dataBase:
    "https://raw.githubusercontent.com/michalskop/cz-municipalities-votes-2022-2026/main/praha/analyses",

  // vote-corrections deliberately excluded — cities don't publish corrections
  // (plan.md D6).
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "PLACEHOLDER", // D10 — owner creates a real Matomo site ID before go-live (task A4)
  },

  // Cities have no constituency/region organization (same as sk-nrsr).
  // "group" here models Prague's real D7 fallback: praha's live klub data is
  // unscrapable (JS SPA, no API) so group membership is sourced from each
  // assembly member's original 2022 candidate-list affiliation instead (a
  // `classification: "candidate_list"` organization per D7's standing rule,
  // modeled by the shared analysis pipeline as `classification: "group"` in
  // its outputs — see the "current_members/current_groups" note in
  // DIVERGENCE.md for exactly how this shows up in the data this app reads).
  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub", plural: "kluby", listTitle: "Zastupitelské kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Council groups" },
      },
    },
  ],

  translations: { cs: prahaCs, en: prahaEn },

  pages: {
    home: [
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Jeden bod = jeden zastupitel/ka. Kliknutím přejdete na jejich profil." },
          en: { title: "Attendance", description: "Each dot = one assembly member. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa zastupitelů podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of assembly members by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často zastupitel/ka hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the assembly member votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        // yMode here is otherwise-unused for this metric: MpMetricSwarmChart
        // special-cases metric === "govity" to a tight, data-driven y-domain
        // (floor a little below the real min, ceiling fixed at 100%) instead
        // of "auto"'s 0-floor scaling — the shared PageBlockConfig type
        // (packages/parliament-core, read-only) only allows "full" | "auto",
        // so this can't be a third yMode literal; see MpMetricSwarmChart.tsx.
        // Owner fix (2026-08-05, DIVERGENCE.md §7): "auto" (0–~120% domain)
        // made every party look identically clustered at ~100%, hiding the
        // real ~98.7–100% party-mean spread (individual members range
        // ~97.9–100%).
        // yDecimals:1 added 2026-08-27 (owner request): with yDecimals defaulting to 0,
        // the average reference line rounded to a flat "100 %" even when the real party
        // mean was e.g. 99.6%, reading as more uniform than the data actually is. Same
        // fixed-1-decimal treatment rebelity already gets above, for the same reason
        // (small/near-ceiling differences need at least one decimal to stay legible).
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často zastupitel/ka hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the assembly member votes in line with the coalition." },
        },
      },
    ],

    memberDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Pozice v rámci zastupitelstva." },
          en: { title: "Attendance", description: "Position within the assembly." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their group." },
        },
      },
      {
        id: "govity-swarm",
        // yMode here is otherwise-unused for this metric: MpMetricSwarmChart
        // special-cases metric === "govity" to a tight, data-driven y-domain
        // (floor a little below the real min, ceiling fixed at 100%) instead
        // of "auto"'s 0-floor scaling — the shared PageBlockConfig type
        // (packages/parliament-core, read-only) only allows "full" | "auto",
        // so this can't be a third yMode literal; see MpMetricSwarmChart.tsx.
        // Owner fix (2026-08-05, DIVERGENCE.md §7): "auto" (0–~120% domain)
        // made every party look identically clustered at ~100%, hiding the
        // real ~98.7–100% party-mean spread (individual members range
        // ~97.9–100%).
        // yDecimals:1 added 2026-08-27 (owner request): with yDecimals defaulting to 0,
        // the average reference line rounded to a flat "100 %" even when the real party
        // mean was e.g. 99.6%, reading as more uniform than the data actually is. Same
        // fixed-1-decimal treatment rebelity already gets above, for the same reason
        // (small/near-ceiling differences need at least one decimal to stay legible).
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often they vote in line with the coalition." },
        },
      },
    ],

    groupDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Členové klubu v kontextu celého zastupitelstva." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full assembly." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          cs: { title: "Členové klubu" },
          en: { title: "Group members" },
        },
      },
    ],

    // No regionDetail — cities have no constituency organization (see D5 note above).
  },
};

// Added 2026-08-27, once Brno's data pipeline reached the same maturity as
// Praha's (C2/C3/C4/D7 all done — see brno/README.md in the city data repo):
// real party/klub organizations (D7's PREFERRED case, not Praha's
// candidate_list fallback — Brno's live feed gives dated group-membership
// intervals directly), owner-approved government_groups, and nightly
// automation (G4/G7 gates) already producing real committed output.
const BRNO: CityConfig = {
  id: "brno",
  citySlug: "brno",
  name: "Zastupitelstvo města Brna",
  defaultLang: "cs",

  dataBase:
    "https://raw.githubusercontent.com/michalskop/cz-municipalities-votes-2022-2026/main/brno/analyses",

  // vote-corrections deliberately excluded — cities don't publish corrections
  // (plan.md D6), same as Praha.
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "PLACEHOLDER", // D10 — owner creates a real Matomo site ID before go-live (task A4)
  },

  // Unlike Praha's `classification: "group"` (which models a D7 FALLBACK —
  // candidate-list origin data relabeled as "group" for display, since
  // praha.eu's live klub data isn't scrapable), Brno's underlying
  // organizations.csv rows are ALREADY `classification: "group"` natively —
  // real live klub membership from the feed, no relabeling involved. The
  // CityConfig-level routing/display shape is identical either way (both
  // cities have a "kluby"/"groups" concept with its own list + detail
  // pages), so this block is structurally the same as Praha's.
  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub", plural: "kluby", listTitle: "Zastupitelské kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Council groups" },
      },
    },
  ],

  translations: { cs: brnoCs, en: brnoEn },

  pages: {
    home: [
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Jeden bod = jeden zastupitel/ka. Kliknutím přejdete na jejich profil." },
          en: { title: "Attendance", description: "Each dot = one assembly member. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa zastupitelů podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of assembly members by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často zastupitel/ka hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the assembly member votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        // Same yMode special-case as Praha — see PRAHA's matching comment
        // above for why this can't be a third PageBlockConfig yMode literal.
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často zastupitel/ka hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the assembly member votes in line with the coalition." },
        },
      },
    ],

    memberDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Pozice v rámci zastupitelstva." },
          en: { title: "Attendance", description: "Position within the assembly." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often they vote in line with the coalition." },
        },
      },
    ],

    groupDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Členové klubu v kontextu celého zastupitelstva." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full assembly." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          cs: { title: "Členové klubu" },
          en: { title: "Group members" },
        },
      },
    ],

    // No regionDetail — cities have no constituency organization (see D5 note above).
  },
};

// Added 2026-08-27, once Ostrava's data pipeline reached the same maturity as
// Praha's/Brno's (C9/C4/D7 all done — see ostrava/README.md in the city data repo):
// a from-scratch HTML scrape (no JSON/CSV API, unlike Praha/Brno), real DATED
// klub organizations (party_affiliation.py captured the 2023 ANO club split
// with exact dates straight from primary vote-page data), owner-approved
// government_groups, and nightly automation already producing real committed
// output.
const OSTRAVA: CityConfig = {
  id: "ostrava",
  citySlug: "ostrava",
  name: "Zastupitelstvo města Ostravy",
  defaultLang: "cs",

  dataBase:
    "https://raw.githubusercontent.com/michalskop/cz-municipalities-votes-2022-2026/main/ostrava/analyses",

  // vote-corrections deliberately excluded — cities don't publish corrections
  // (plan.md D6), same as Praha/Brno.
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "PLACEHOLDER", // D10 — owner creates a real Matomo site ID before go-live (task A4)
  },

  // Same as Brno: Ostrava's organizations.csv rows are natively
  // `classification: "group"` — real klub membership derived from dated
  // per-vote groupings, not a candidate-list relabeling.
  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub", plural: "kluby", listTitle: "Zastupitelské kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Council groups" },
      },
    },
  ],

  translations: { cs: ostravaCs, en: ostravaEn },

  pages: {
    home: [
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Jeden bod = jeden zastupitel/ka. Kliknutím přejdete na jejich profil." },
          en: { title: "Attendance", description: "Each dot = one assembly member. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa zastupitelů podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of assembly members by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často zastupitel/ka hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the assembly member votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        // Same yMode special-case + yDecimals:1 as Praha/Brno — see PRAHA's
        // matching comment above for both the yMode reasoning and the
        // 2026-08-27 yDecimals:1 addition.
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často zastupitel/ka hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the assembly member votes in line with the coalition." },
        },
      },
    ],

    memberDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Pozice v rámci zastupitelstva." },
          en: { title: "Attendance", description: "Position within the assembly." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often they vote in line with the coalition." },
        },
      },
    ],

    groupDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Členové klubu v kontextu celého zastupitelstva." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full assembly." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          cs: { title: "Členové klubu" },
          en: { title: "Group members" },
        },
      },
    ],

    // No regionDetail — cities have no constituency organization (see D5 note above).
  },
};

// Added 2026-08-28, once Most's data pipeline reached the same maturity as
// Praha's/Brno's/Ostrava's (C9/C4/D7 all done — see most/config/sources.yml in
// the city data repo): same shared zastupko.cz backend Brno uses, real DATED
// klub organizations straight from the feed's politickeSubjekty[] intervals
// (same mechanism as Brno, not Ostrava's per-vote grouping), owner-approved
// government_groups (ProMOST + ANO 2011), and nightly automation already
// producing real committed output. Rada (executive council) data deliberately
// NOT wired here — zastupitelstvo-only per the owner's 2026-08-27 scope
// decision; rada is a distinct future phase.
const MOST: CityConfig = {
  id: "most",
  citySlug: "most",
  name: "Zastupitelstvo města Mostu",
  defaultLang: "cs",

  dataBase:
    "https://raw.githubusercontent.com/michalskop/cz-municipalities-votes-2022-2026/main/most/analyses",

  // vote-corrections deliberately excluded — cities don't publish corrections
  // (plan.md D6), same as Praha/Brno/Ostrava.
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "PLACEHOLDER", // D10 — owner creates a real Matomo site ID before go-live (task A4)
  },

  // Same as Brno: Most's organizations.csv rows are natively
  // `classification: "group"` — real klub membership derived from dated
  // politickeSubjekty[] intervals, not a candidate-list relabeling.
  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub", plural: "kluby", listTitle: "Zastupitelské kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Council groups" },
      },
    },
  ],

  translations: { cs: mostCs, en: mostEn },

  pages: {
    home: [
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Jeden bod = jeden zastupitel/ka. Kliknutím přejdete na jejich profil." },
          en: { title: "Attendance", description: "Each dot = one assembly member. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa zastupitelů podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of assembly members by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často zastupitel/ka hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the assembly member votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        // Same yMode special-case + yDecimals:1 as Praha/Brno/Ostrava — see
        // PRAHA's matching comment above for both the yMode reasoning and the
        // 2026-08-27 yDecimals:1 addition.
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často zastupitel/ka hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the assembly member votes in line with the coalition." },
        },
      },
    ],

    memberDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Pozice v rámci zastupitelstva." },
          en: { title: "Attendance", description: "Position within the assembly." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often they vote in line with the coalition." },
        },
      },
    ],

    groupDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Členové klubu v kontextu celého zastupitelstva." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full assembly." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          cs: { title: "Členové klubu" },
          en: { title: "Group members" },
        },
      },
    ],

    // No regionDetail — cities have no constituency organization (see D5 note above).
  },
};

// Added 2026-08-28, once Plzeň's data pipeline reached the same maturity as
// every other city (C9/C4/D7 all done — see plzen/config/sources.yml in the
// city data repo): the hardest source of the five (no JSON API, THREE
// different vote-protocol formats across the single term, incl. a current
// PDF-based one), real DATED klub organizations derived from per-vote klub
// text (contiguous-run interval detection, not a source-provided interval
// list), owner-approved government_groups (ANO 2011 a nezávislí + Piráti +
// STAN + PRO PLZEŇ), and nightly automation already producing real committed
// output.
const PLZEN: CityConfig = {
  id: "plzen",
  citySlug: "plzen",
  name: "Zastupitelstvo města Plzně",
  defaultLang: "cs",

  dataBase:
    "https://raw.githubusercontent.com/michalskop/cz-municipalities-votes-2022-2026/main/plzen/analyses",

  // vote-corrections deliberately excluded — cities don't publish corrections
  // (plan.md D6), same as every other city.
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "PLACEHOLDER", // D10 — owner creates a real Matomo site ID before go-live (task A4)
  },

  // Plzeň's organizations.csv rows are natively `classification: "group"` —
  // real klub membership derived from per-vote klub text, not a
  // candidate-list relabeling.
  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub", plural: "kluby", listTitle: "Zastupitelské kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Council groups" },
      },
    },
  ],

  translations: { cs: plzenCs, en: plzenEn },

  pages: {
    home: [
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Jeden bod = jeden zastupitel/ka. Kliknutím přejdete na jejich profil." },
          en: { title: "Attendance", description: "Each dot = one assembly member. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa zastupitelů podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of assembly members by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často zastupitel/ka hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the assembly member votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        // Same yMode special-case + yDecimals:1 as every other city — see
        // PRAHA's matching comment above for both the yMode reasoning and the
        // 2026-08-27 yDecimals:1 addition.
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často zastupitel/ka hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the assembly member votes in line with the coalition." },
        },
      },
    ],

    memberDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Pozice v rámci zastupitelstva." },
          en: { title: "Attendance", description: "Position within the assembly." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often they vote in line with the coalition." },
        },
      },
    ],

    groupDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Členové klubu v kontextu celého zastupitelstva." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full assembly." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          cs: { title: "Členové klubu" },
          en: { title: "Group members" },
        },
      },
    ],

    // No regionDetail — cities have no constituency organization (see D5 note above).
  },
};

// Added 2026-08-29, once Ústí nad Labem's data pipeline reached the same
// maturity as every other city (C9/C4/D7 all done — see
// usti-nad-labem/config/sources.yml in the city data repo): the cleanest
// source found across all 7 cities so far (one clean text-layer PDF per
// meeting, no login, no format drift, no font-encoding corruption), real
// DATED klub organizations derived from per-vote klub text (same
// contiguous-run mechanism as Plzeň), and an owner-approved government_groups
// + government_members fact (ANO2011 + SPD + 2 named individual defectors
// from UFO/ODS who are formally "nezařazení") — the first city needing named
// individuals alongside whole klubs. Real, strong government/opposition WPCA
// axis found (r=0.97), unlike most-rada's all-government case.
const USTI_NAD_LABEM: CityConfig = {
  id: "usti-nad-labem",
  citySlug: "usti-nad-labem",
  name: "Zastupitelstvo města Ústí nad Labem",
  defaultLang: "cs",

  dataBase:
    "https://raw.githubusercontent.com/michalskop/cz-municipalities-votes-2022-2026/main/usti-nad-labem/analyses",

  // vote-corrections deliberately excluded — cities don't publish corrections
  // (plan.md D6), same as every other city.
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "PLACEHOLDER", // D10 — owner creates a real Matomo site ID before go-live (task A4)
  },

  // Ústí nad Labem's organizations.csv rows are natively `classification:
  // "group"` — real klub membership derived from per-vote klub text
  // (mode-per-meeting + contiguous-run interval detection), same mechanism
  // as Plzeň's and most-rada's pipelines.
  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub", plural: "kluby", listTitle: "Zastupitelské kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Council groups" },
      },
    },
  ],

  translations: { cs: ustiNadLabemCs, en: ustiNadLabemEn },

  pages: {
    home: [
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Jeden bod = jeden zastupitel/ka. Kliknutím přejdete na jejich profil." },
          en: { title: "Attendance", description: "Each dot = one assembly member. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa zastupitelů podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of assembly members by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často zastupitel/ka hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the assembly member votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často zastupitel/ka hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the assembly member votes in line with the coalition." },
        },
      },
    ],

    memberDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Pozice v rámci zastupitelstva." },
          en: { title: "Attendance", description: "Position within the assembly." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often they vote in line with the coalition." },
        },
      },
    ],

    groupDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Členové klubu v kontextu celého zastupitelstva." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full assembly." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          cs: { title: "Členové klubu" },
          en: { title: "Group members" },
        },
      },
    ],

    // No regionDetail — cities have no constituency organization (see D5 note above).
  },
};

// Added 2026-08-30, once Hradec Králové's data pipeline reached the same
// maturity as every other city (C9/C4/D7 all done — see
// hradec-kralove/config/sources.yml in the city data repo): the same shared
// zastupko.fit.vutbr.cz JSON backend as Brno/Most/most-rada (dataset id 9,
// real per-person votes via zastupiteleHlasy[], real DATED klub
// organizations from the feed's politickeSubjekty[] intervals). Owner-approved
// government_groups + government_members fact (D7, 2026-08-30): the narrowed
// 4-party coalition PIRÁTI + HDK/TOP09 + ODS + ZPHZ, plus 3 named individual
// defectors now formally "NEZ" (2 from ANO 2011, 1 from Rozvíjíme Hradec) who
// vote with the coalition. Rozvíjíme Hradec (RH) was a genuine coalition
// partner for the term's first ~13 months before being pushed out, but this
// project's schema only supports one static government_groups list — owner
// explicitly chose to EXCLUDE RH for the whole term (the lesser inaccuracy).
// Real, strong government/opposition WPCA axis found (r=0.98 on dim0,
// government_sign=1), like Ústí nad Labem, unlike most-rada's all-government
// case.
const HRADEC_KRALOVE: CityConfig = {
  id: "hradec-kralove",
  citySlug: "hradec-kralove",
  name: "Zastupitelstvo města Hradec Králové",
  defaultLang: "cs",

  dataBase:
    "https://raw.githubusercontent.com/michalskop/cz-municipalities-votes-2022-2026/main/hradec-kralove/analyses",

  // vote-corrections deliberately excluded — cities don't publish corrections
  // (plan.md D6), same as every other city.
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "PLACEHOLDER", // D10 — owner creates a real Matomo site ID before go-live (task A4)
  },

  // Hradec Králové's organizations.csv rows are natively `classification:
  // "group"` — real klub membership derived from the feed's dated
  // politickeSubjekty[] intervals, same mechanism as Brno's/Most's pipelines.
  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub", plural: "kluby", listTitle: "Zastupitelské kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Council groups" },
      },
    },
  ],

  translations: { cs: hradecKraloveCs, en: hradecKraloveEn },

  pages: {
    home: [
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Jeden bod = jeden zastupitel/ka. Kliknutím přejdete na jejich profil." },
          en: { title: "Attendance", description: "Each dot = one assembly member. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa zastupitelů podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of assembly members by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často zastupitel/ka hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the assembly member votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často zastupitel/ka hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the assembly member votes in line with the coalition." },
        },
      },
    ],

    memberDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Pozice v rámci zastupitelstva." },
          en: { title: "Attendance", description: "Position within the assembly." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often they vote in line with the coalition." },
        },
      },
    ],

    groupDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Členové klubu v kontextu celého zastupitelstva." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full assembly." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          cs: { title: "Členové klubu" },
          en: { title: "Group members" },
        },
      },
    ],

    // No regionDetail — cities have no constituency organization (see D5 note above).
  },
};

// Added 2026-08-31, once Pardubice's data pipeline reached the same maturity
// as every other city (C9/C4/D7 all done — see pardubice/config/sources.yml in
// the city data repo). NOT on the shared zastupko backend: Pardubice publishes
// its own per-meeting ZIP archives on pardubice.eu, each with a dedicated
// clean-text-layer voting PDF (occasionally a UTF-16 .txt) — a from-scratch
// parser handling two PDF format eras + heavy page furniture. organizations.csv
// rows are natively `classification: "group"` — real dated klub membership
// derived from the per-vote klub column (mode per meeting + contiguous-run
// intervals, canonicalised), same mechanism as Plzeň/Ústí. Owner-approved
// government_groups (D7, 2026-08-31): ANO 2011 + Žijeme Pardubice + Společně
// pro Pardubice — the narrowest possible 20/39 majority under primátor Jan
// Nadrchal (ANO 2011), held for the whole term; no named individual defectors
// (government_members empty). Real, strong government/opposition WPCA axis
// (dim0 r=0.93, government_sign=1), like Ústí nad Labem and Hradec Králové.
const PARDUBICE: CityConfig = {
  id: "pardubice",
  citySlug: "pardubice",
  name: "Zastupitelstvo města Pardubic",
  defaultLang: "cs",

  dataBase:
    "https://raw.githubusercontent.com/michalskop/cz-municipalities-votes-2022-2026/main/pardubice/analyses",

  // vote-corrections deliberately excluded — cities don't publish corrections
  // (plan.md D6), same as every other city.
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "PLACEHOLDER", // D10 — owner creates a real Matomo site ID before go-live (task A4)
  },

  // Pardubice's organizations.csv rows are natively `classification: "group"` —
  // real klub membership derived from the per-vote klub column in each meeting's
  // voting PDF (mode per meeting + contiguous-run intervals, canonicalised),
  // same mechanism as Plzeň's / Ústí's pipelines.
  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub", plural: "kluby", listTitle: "Zastupitelské kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Council groups" },
      },
    },
  ],

  translations: { cs: pardubiceCs, en: pardubiceEn },

  pages: {
    home: [
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Jeden bod = jeden zastupitel/ka. Kliknutím přejdete na jejich profil." },
          en: { title: "Attendance", description: "Each dot = one assembly member. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa zastupitelů podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of assembly members by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často zastupitel/ka hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the assembly member votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často zastupitel/ka hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the assembly member votes in line with the coalition." },
        },
      },
    ],

    memberDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Pozice v rámci zastupitelstva." },
          en: { title: "Attendance", description: "Position within the assembly." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often they vote in line with the coalition." },
        },
      },
    ],

    groupDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Členové klubu v kontextu celého zastupitelstva." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full assembly." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          cs: { title: "Členové klubu" },
          en: { title: "Group members" },
        },
      },
    ],

    // No regionDetail — cities have no constituency organization (see D5 note above).
  },
};

/** All configured cities. Append here to add a city (see module doc above). */
// Added 2026-08-29: Most's RADA (executive council), modeled as a separate
// pseudo-city per the owner's 2026-08-28 decision — reuses this entire
// single-body architecture rather than teaching the dashboard a new
// multi-organization-per-city concept. Same shared zastupko.cz backend as
// MOST's own zastupitelstvo pipeline (organ="rada" instead of
// "zastupitelstvo"). Every member is government by construction (rada IS
// the coalition's executive body, no opposition seat ever exists) — owner
// confirmed publishing govity/wpca anyway for consistency, even though the
// government-axis signal is expected to be near-zero for this body.
const MOST_RADA: CityConfig = {
  id: "most-rada",
  citySlug: "most-rada",
  name: "Rada města Mostu",
  defaultLang: "cs",

  dataBase:
    "https://raw.githubusercontent.com/michalskop/cz-municipalities-votes-2022-2026/main/most-rada/analyses",

  // vote-corrections deliberately excluded — cities don't publish corrections
  // (plan.md D6), same as every other city.
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "PLACEHOLDER", // D10 — owner creates a real Matomo site ID before go-live (task A4)
  },

  // most-rada's organizations.csv rows are natively `classification: "group"`
  // — real klub membership derived from the feed's dated politickeSubjekty[]
  // intervals, same mechanism as most/'s own zastupitelstvo pipeline.
  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub", plural: "kluby", listTitle: "Kluby v radě" },
        en: { singular: "group", plural: "groups", listTitle: "Council groups" },
      },
    },
  ],

  translations: { cs: mostRadaCs, en: mostRadaEn },

  pages: {
    home: [
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Jeden bod = jeden člen/ka rady. Kliknutím přejdete na jejich profil." },
          en: { title: "Attendance", description: "Each dot = one council member. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa členů rady podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of council members by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často člen/ka rady hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the council member votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často člen/ka rady hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the council member votes in line with the coalition." },
        },
      },
    ],

    memberDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Pozice v rámci rady." },
          en: { title: "Attendance", description: "Position within the council." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often they vote in line with the coalition." },
        },
      },
    ],

    groupDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Členové klubu v kontextu celé rady." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full council." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          cs: { title: "Členové klubu" },
          en: { title: "Group members" },
        },
      },
    ],

    // No regionDetail — cities have no constituency organization (see D5 note above).
  },
};

// Ordered by population (owner preference, 2026-08-28), latest ČSÚ figures (1 Jan 2026): Praha
// (~1.27M), Brno (~384k), Ostrava (~302k), Plzeň (~188k), Hradec Králové (93,354), Pardubice
// (92,713), Ústí nad Labem (90,035), Most (~63k). Hradec Králové, Pardubice and Ústí nad Labem
// are within ~3k of each other, ordered strictly by the 1 Jan 2026 figure — same "list by size,
// not build order" rule the owner gave for Plzeň-vs-Most. most-rada sits last: a bonus second
// body for Most, not a separate real city, listed after every real city regardless of size.
export const CITIES: CityConfig[] = [PRAHA, BRNO, OSTRAVA, PLZEN, HRADEC_KRALOVE, PARDUBICE, USTI_NAD_LABEM, MOST, MOST_RADA];

export function getCityConfig(citySlug: string): CityConfig | undefined {
  return CITIES.find((c) => c.citySlug === citySlug);
}

export function getCitySlugs(): string[] {
  return CITIES.map((c) => c.citySlug);
}

export function getCityTranslations(city: CityConfig, lang: string) {
  return city.translations[lang] ?? city.translations[city.defaultLang]!;
}
