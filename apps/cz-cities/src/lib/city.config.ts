import type { ParliamentConfig, ParliamentTranslations } from "@legislature/parliament-core";
import { prahaCs } from "./dictionaries/praha.cs";
import { prahaEn } from "./dictionaries/praha.en";
import { brnoCs } from "./dictionaries/brno.cs";
import { brnoEn } from "./dictionaries/brno.en";

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
// Praha and Brno are populated (real data, owner sign-off DONE 2026-08-04
// and 2026-08-27 respectively). Ostrava doesn't have a working data pipeline
// yet (C9 hasn't run) — adding a placeholder config for it here would be
// premature (no data to back a
// real page) and is explicitly out of scope for A2 per the task brief.
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

/** All configured cities. Append here to add a city (see module doc above). */
export const CITIES: CityConfig[] = [PRAHA, BRNO];

export function getCityConfig(citySlug: string): CityConfig | undefined {
  return CITIES.find((c) => c.citySlug === citySlug);
}

export function getCitySlugs(): string[] {
  return CITIES.map((c) => c.citySlug);
}

export function getCityTranslations(city: CityConfig, lang: string) {
  return city.translations[lang] ?? city.translations[city.defaultLang]!;
}
