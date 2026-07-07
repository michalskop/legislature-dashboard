# Adding or Updating an Analysis (dashboard part)

This repo is **layer 4 of a four-repo pipeline**. The canonical end-to-end guide — pipeline overview,
naming contract, output-shape contract, and reusability rules — lives in the standard repo:
**[legislature-data-standard/docs/adding-an-analysis.md](https://github.com/michalskop/legislature-data-standard/blob/main/docs/adding-an-analysis.md)**.
Read it first. This document covers only the dashboard-side steps.

## Prerequisites (layers 1–3, external)

Before touching this repo, the upstream layers must be done — see the canonical guide:

1. **Standard** ([legislature-data-standard](https://github.com/michalskop/legislature-data-standard)):
   definition + output + table schemas published.
2. **Analysis script** ([legislature-data-analyses](https://github.com/michalskop/legislature-data-analyses)):
   parliament-agnostic script with passing tests on ≥2 legislatures.
3. **Data repo(s)** (e.g. `cz-psp-data-2025-202x`): nightly Action commits
   `analyses/<slug>/outputs/<slug_snake>.json` — the dashboard fetches exactly
   `{parliamentConfig.dataBase}/<slug>/outputs/<slug_snake>.json`.

> **Note:** until the app-deduplication refactor lands, steps 2–4 below must be repeated in **every**
> app (`apps/cz-psp`, `apps/sk-nrsr`, …). Keep the copies identical except for config. If a parliament's
> data repo does not publish the analysis, exclude it via that app's `parliamentConfig.analyses` — never
> by hardcoding nulls in shared code.

## 1. Core types (`packages/parliament-core`)

- **Block config**: if the metric appears in charts/tables, add the analysis slug to the relevant
  `BlockConfig` union member (e.g. `SwarmBlockConfig.analysis`) in `src/types.ts`.
- **Translations**: add the metric label key to the `ParliamentTranslations` interface.

## 2. Application types (`apps/*/src/lib/types.ts`)

- **Record interface**: define `<Pascal>Record` mirroring the published output schema exactly
  (`person_id`, the metric fields, the shared metadata block). Do not invent fields the schema doesn't
  have.
- **`MpProfile`**: add the processed metric (nullable — a member may be missing from the analysis).
- **`PartyProfile` / `KrajProfile`**: only if the metric aggregates at group/region level.

## 3. Data fetching (`apps/*/src/lib/data.ts`)

1. **Fetch function**: `fetch<Pascal>()` using `fetchJson<T>("<slug>/outputs/<slug_snake>.json")`.
2. **`getAllMpProfiles()`**: add the fetcher to the `Promise.all`, index the result by `person_id`
   (`new Map(records.map(r => [r.person_id, r]))`), and map it into the returned `MpProfile`s — `null`
   when the person is absent from the analysis.
3. **Aggregations**: extend `getAllPartyProfiles()` / `getAllKrajProfiles()` if the metric is averaged.

## 4. Parliament configuration (`apps/*/src/lib/parliament.config.ts`)

- **`analyses`**: add `<slug>` — this is the switch that says "this parliament has this analysis".
- **`translations`**: add `metrics.<key>` (and any `ui.*` strings the metric needs) for **all**
  supported languages of the app. Missing a language is a review blocker.
- **`pages`**: add `PageBlock` entries (`swarm-chart`, `scatter-chart`, `metrics-grid` column, …) to
  `home` / `memberDetail` / `groupDetail` / `regionDetail` as appropriate, with per-language labels.

## 5. UI components (only if no existing block type fits)

- **Charts**: extend `packages/charts` (or add a new block type: new `XxxBlockConfig` in
  parliament-core → `BlockConfig` union → `PageBlockRenderer` case → config entries).
- **Table**: add the column to `SortableMpTable` in `packages/ui`.
- **Rule**: shared components stay parliament-agnostic — data, labels, and colors arrive via props/config,
  never via imported constants.

## Verification checklist

- [ ] Record type matches the published JSON Schema (spot-check against
      `https://michalskop.github.io/legislature-data-standard/dt.analyses/<slug>/latest/`).
- [ ] Metric renders on member detail, tables, and charts for every app whose data repo publishes it.
- [ ] Apps without the analysis degrade gracefully (driven by `parliamentConfig.analyses`).
- [ ] All languages of every touched app have translations.
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass across the monorepo.
