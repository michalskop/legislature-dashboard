import type { ParliamentConfig } from "@legislature/parliament-core";
import { prahaCs } from "./dictionaries/praha.cs";
import { prahaEn } from "./dictionaries/praha.en";

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
// Only Praha is populated for now — real data exists (plan.md C7/C8, owner
// sign-off DONE 2026-08-04). Brno/Ostrava don't have working data pipelines
// yet (kod.brno.cz was 503 during C1; Ostrava's C9 hasn't run) — adding
// placeholder configs for them here would be premature (no data to back a
// real page) and is explicitly out of scope for A2 per the task brief.
// ─────────────────────────────────────────────────────────────────────────

export type CityConfig = ParliamentConfig & {
  /** URL segment for this city, e.g. "praha" -> /praha, /en/praha */
  citySlug: string;
};

const PRAHA: CityConfig = {
  id: "praha",
  citySlug: "praha",
  name: "Zastupitelstvo hlavního města Prahy",
  defaultLang: "cs",

  // Documents the future real fetch shape (per plan.md D2/D3/D8): the city
  // data repo (cz-municipalities-votes-2022-2026, public, no B2) commits both
  // the four analysis outputs under `<city>/analyses/<slug>/outputs/` and the
  // raw standard tables under `<city>/data/*.csv`. `dataBase` here points at
  // the analyses root (same convention apps/cz-psp already uses for its own
  // `dataBase`); src/lib/data.ts derives the sibling raw-tables URL from it.
  // Not fetched yet — src/lib/data.ts reads committed local fixtures under
  // src/fixtures/praha/ instead (same fixture strategy A1 used, now
  // populated with real, schema-validated, owner-approved Praha data instead
  // of fictional placeholders — see DIVERGENCE.md "Real data" section).
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
  // councillor's original 2022 candidate-list affiliation instead (a
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
          en: { title: "Attendance", description: "Each dot = one councillor. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa zastupitelů podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of councillors by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často zastupitel/ka hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the councillor votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto" },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často zastupitel/ka hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the councillor votes in line with the coalition." },
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
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto" },
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
export const CITIES: CityConfig[] = [PRAHA];

export function getCityConfig(citySlug: string): CityConfig | undefined {
  return CITIES.find((c) => c.citySlug === citySlug);
}

export function getCitySlugs(): string[] {
  return CITIES.map((c) => c.citySlug);
}

export function getCityTranslations(city: CityConfig, lang: string) {
  return city.translations[lang] ?? city.translations[city.defaultLang]!;
}
