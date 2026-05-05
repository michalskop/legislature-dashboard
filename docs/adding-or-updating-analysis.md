# Adding or Updating an Analysis

This guide describes the end-to-end process of adding a new type of analysis (e.g., "Loyalty") or updating an existing one (e.g., "Attendance") in the legislature dashboard.

## 1. Data Standards (External)
Before any code is written in this repository, the analysis MUST comply with the [legislature-data-standard](https://github.com/michalskop/legislature-data-standard).

- **Schema Check**: Ensure the proposed JSON structure matches an existing schema or define a new one in the standard repo.
- **Consistency**: All parliaments must produce the same analysis structure for the shared dashboard components to work.

## 2. Analysis Production (External)
The actual computation happens in the [legislature-data-analyses](https://github.com/michalskop/legislature-data-analyses) repository.

- **Implementation**: Write the script to process raw legislative data into the standardized JSON format.
- **Output**: The script should output a JSON file (e.g., `loyalty.json`).

## 3. Data Repository (External)
The nightly GitHub Action in the parliament's data repo (e.g., `cz-psp-data-2025-202x`) must be updated to include the new analysis.

- **Path**: The standard path is `{dataBase}/{analysis_slug}/outputs/{analysis_slug}.json`.
- **Example**: `.../analyses/attendance/outputs/attendance.json`.

## 4. Core Types (`packages/parliament-core`)
If the analysis is a new metric, update the shared types in `packages/parliament-core/src/types.ts`:

- **Block Config**: Add the analysis slug to the relevant `BlockConfig` (e.g., `SwarmBlockConfig` or `MemberTableBlockConfig`).
- **Translations**: Add the metric label to the `ParliamentTranslations` interface.

## 5. Application Types (`apps/*/src/lib/types.ts`)
Update the app-specific types to include the new data:

- **Record Interface**: Define the raw record interface (e.g., `LoyaltyRecord`) matching the JSON output.
- **`MpProfile`**: Add the processed metric to the `MpProfile` interface.
- **`PartyProfile` / `KrajProfile`**: If the metric should be aggregated at the group or region level, add it here.

## 6. Data Fetching (`apps/*/src/lib/data.ts`)
Update the data layer to retrieve the new JSON:

1.  **Fetch Function**: Create a `fetchXxx()` function using `fetchJson<T>(path)`.
    - *Note: `fetchJson` automatically handles `NaN` → `null` conversion.*
2.  **`getAllMpProfiles()`**:
    - Add the new fetcher to the `Promise.all` block.
    - Index the data by `person_id`.
    - Map the data into the returned `MpProfile` objects.
3.  **Aggregations**: Update `getAllPartyProfiles()` or `getAllKrajProfiles()` if you need to calculate averages for the new metric.

## 7. Parliament Configuration (`parliament.config.ts`)
Register the analysis in the app's `parliament.config.ts`:

- **`analyses`**: Add the analysis slug to the top-level array.
- **`translations`**: Add the human-readable labels for all supported languages.
- **`pages`**: Add new `PageBlock` entries (e.g., `swarm-chart` or `metrics-grid`) to the home page or detail pages.

## 8. UI Components
If the existing components (`SwarmPlot`, `SortableMpTable`, etc.) cannot handle the new data:

- **Charts**: Update components in `packages/charts` or create new ones.
- **Table**: Update `SortableMpTable.tsx` to include the new column.
- **Styling**: Ensure any new colors or icons follow the design system in `packages/ui`.

## Verification Checklist
- [ ] JSON output matches `legislature-data-standard`.
- [ ] `fetchJson` is used to sanitize `NaN` values.
- [ ] All translations are provided for the new metric.
- [ ] `pnpm typecheck` passes across the monorepo.
- [ ] The new metric is visible in the UI (Member detail, tables, or charts).
