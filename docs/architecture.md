# Architecture: legislature-dashboard

## Overview

`legislature-dashboard` is a Turborepo monorepo designed to host dashboards for multiple parliaments
(Czech Sněmovna, Czech Senate, European Parliament, Slovak parliament, …) as separate Next.js apps
that share a common set of packages.

Each parliament gets its own app (and its own domain/deployment) configured via a typed
`ParliamentConfig` object. Shared logic lives in packages.

---

## Monorepo structure

```
legislature-dashboard/
├── apps/
│   └── cz-psp/                  Next.js app — snemovna.datatimes.cz
│       └── src/
│           ├── app/             Next.js App Router routes
│           │   ├── (site)/
│           │   │   ├── page.tsx             /  (home, overview charts)
│           │   │   ├── member/[id]/page.tsx  /member/[id]
│           │   │   ├── members/page.tsx      /members
│           │   │   ├── group/[id]/page.tsx   /group/[id]
│           │   │   ├── groups/page.tsx       /groups
│           │   │   ├── region/[id]/page.tsx  /region/[id]
│           │   │   ├── regions/page.tsx      /regions
│           │   │   └── o-projektu/page.tsx   /o-projektu
│           │   └── api/revalidate/route.ts   on-demand ISR
│           ├── components/      App-specific React components
│           └── lib/
│               ├── data.ts              data fetchers + profile builders
│               ├── types.ts             MpProfile, PartyProfile, KrajProfile
│               ├── groups.ts            slug helpers, party → ID mapping
│               └── parliament.config.ts ParliamentConfig for cz-psp
│
├── packages/
│   ├── parliament-core/         Parliament configuration types (NEW)
│   │   └── src/
│   │       ├── types.ts         ParliamentConfig, OrgTypeConfig, etc.
│   │       └── index.ts
│   ├── ui/                      Shared React components
│   │   └── src/
│   │       ├── components/
│   │       │   ├── PartyFace.tsx   SVG badge with party colour + abbreviation
│   │       │   └── PartyBadge.tsx  Party badge + CZ_PSP_PARTY_META
│   │       └── tokens.css          Design tokens (colour scales, semantic tokens)
│   ├── charts/                  Shared visx chart components
│   │   └── src/components/
│   │       ├── SwarmPlot.tsx    Beeswarm chart (attendance, rebelity, govity)
│   │       └── ScatterPlot.tsx  2D scatter (WPCA positions)
│   └── utils/                   Shared utilities
```

---

## Adding a new parliament

1. **Create the app** — copy `apps/cz-psp`, rename, adjust `package.json` name
2. **Write the config** — `src/lib/parliament.config.ts` implementing `ParliamentConfig`
3. **Name the routes** using English URL segments (see URL convention below)
4. **Point `dataBase`** to the data repo raw GitHub URL
5. **Deploy** on Vercel with root directory set to the new app folder

### Example: Czech Senate

```typescript
// apps/cz-senate/src/lib/parliament.config.ts
export const parliamentConfig: ParliamentConfig = {
  id: "cz-senate",
  name: "Senát Parlamentu České republiky",
  defaultLang: "cs",
  dataBase: "https://raw.githubusercontent.com/michalskop/cz-senate-data/main/analyses",
  analyses: ["attendance", "vote-corrections"],
  organizations: [
    {
      classification: "candidate_list",
      urlSegment: "party",
      listUrlSegment: "parties",
      hasPage: true,
      labels: {
        cs: { singular: "strana", plural: "strany", listTitle: "Strany" },
        en: { singular: "party",  plural: "parties", listTitle: "Parties" },
      },
    },
    {
      classification: "constituency",
      urlSegment: "region",
      listUrlSegment: "regions",
      hasPage: true,
      labels: {
        cs: { singular: "obvod",  plural: "obvody",  listTitle: "Volební obvody" },
        en: { singular: "district", plural: "districts", listTitle: "Electoral districts" },
      },
    },
  ],
  translations: { cs: { ... }, en: { ... } },
  pages: {
    home: ["attendance-swarm"],
    memberDetail: ["metrics-grid", "attendance-swarm"],
    groupDetail: ["metrics-grid", "member-table"],
    regionDetail: ["metrics-grid", "member-table"],
  },
};
```

### Example: European Parliament

The EU Parliament is notable because each MEP belongs to **two** interesting org types:

| Classification    | Example         | URL segment |
|-------------------|-----------------|-------------|
| `group`           | EPP, S&D, Renew | `/group/`   |
| `candidate_list`  | ODS, ČSSD, …    | `/party/`   |
| `constituency`    | Czech Republic  | `/region/`  |

Both `group` and `candidate_list` would have `hasPage: true`, giving separate list/detail pages for
EU groups and national parties.

---

## URL convention

All apps use **English, gender-neutral URL segments**. UI display text is configured separately
via translations (see below).

| Route pattern     | Content                              |
|-------------------|--------------------------------------|
| `/`               | Home — overview charts               |
| `/members`        | Member list (sortable table)         |
| `/member/[id]`    | Member detail — metrics + charts     |
| `/groups`         | Group list (parliamentary clubs)     |
| `/group/[id]`     | Group detail — metrics + member table|
| `/parties`        | Candidate list / party list          |
| `/party/[id]`     | Party detail                         |
| `/regions`        | Region/constituency list             |
| `/region/[id]`    | Region detail — metrics + member table|

**Why English URLs:**
- Gender-neutral (Czech "poslanec/poslankyně" is gendered; "member" is not)
- Consistent across all parliament apps regardless of language
- Stable — UI language can change without URL changes
- Aligns with the data standard identifiers

**Redirects** from old Czech URLs are included in `next.config.ts` for backwards compatibility
(`/poslanec/:id → /member/:id`, etc.).

---

## Organization types (`OrgClassification`)

Sourced from `legislature-data-standard`. Each member has memberships in multiple org types:

| Classification    | Meaning                                  | Example (cz-psp)     |
|-------------------|------------------------------------------|----------------------|
| `parliament`      | The parliament itself                    | Poslanecká sněmovna  |
| `group`           | Current parliamentary club/faction       | Klub ODS             |
| `candidate_list`  | Electoral list the member ran on         | ODS (strana)         |
| `constituency`    | Electoral district / region              | Praha                |

In cz-psp, `group` and `candidate_list` are usually the same party — but they can diverge when
an MP switches clubs. The config sets `candidate_list.hasPage: false` for cz-psp since the
distinction is rarely relevant. For EU Parliament both have `hasPage: true`.

---

## Language / translations

Each parliament app supports multiple UI languages via the `translations` map in `ParliamentConfig`.
The default language is set by `defaultLang`. Language preference is stored in a cookie (not yet
implemented — planned).

Translations cover:
- Nav labels (`overview`, `members`)
- Member labels (`singular`, `plural`, `current`, `former`)
- Metric labels (`attendance`, `rebelity`, `govity`, `corrections`, `wpca`)
- Org type labels (per `OrgTypeConfig.labels`)

URL segments are **always English** and do not change with language.

---

## Data layer

### Flow

```
GitHub repo (nightly GitHub Action)
  → raw JSON files (attendance, rebelity, govity, wpca, vote-corrections, current-members)
    → fetchJson() with NaN→null sanitisation
      → getAllMpProfiles() — joins all 6 sources by person_id
        → page components (server components, statically rendered)
          → Vercel ISR (revalidate: 3600)
```

### Key types (`apps/cz-psp/src/lib/types.ts`)

- **`MpProfile`** — all analyses joined for one member; includes `isCurrent: boolean`
- **`PartyProfile`** — aggregated metrics per parliamentary group (current MPs only)
- **`KrajProfile`** — aggregated metrics per constituency (current MPs only)

### `isCurrent` pattern

`getAllMpProfiles()` returns **all** MPs (current + former) so tables can show both.
Charts and aggregations filter to `mp.isCurrent === true` at the page level.
The member detail page always includes the highlighted MP even if former.

---

## Design system

- **Tokens**: `packages/ui/src/tokens.css` — colour scales, semantic tokens
- **Party colours**: `apps/cz-psp/src/app/globals.css`
- **Font**: Roboto Slab (via `next/font/google`)
- **Badge shape**: `rounded-badge` — 3 rounded corners, top-right sharp
- **FACE_PATH**: `"M 11.29 0 Q 0 0 0 11.29 L 0 18.71 Q 0 30 11.29 30 L 18.71 30 Q 30 30 30 18.71 L 30 0 L 11.29 0 Z"` — used for chart dots and `PartyFace` icons

---

## Chart components

All charts live in `packages/charts` and are fully reusable across parliament apps.

| Component         | Use                                    | Key props                                      |
|-------------------|----------------------------------------|------------------------------------------------|
| `SwarmPlot`       | Beeswarm per metric (attendance, …)    | `groups`, `yDomain`, `highlightId`             |
| `ScatterPlot`     | 2D WPCA positions                      | `groups`, `highlightId`, `highlightIds`        |

App-specific wrappers in `apps/cz-psp/src/components/`:

| Component              | Wraps        | Purpose                                  |
|------------------------|--------------|------------------------------------------|
| `MpMetricSwarmChart`   | `SwarmPlot`  | Attendance / rebelity / govity per party |
| `WpcaScatterChart`     | `ScatterPlot`| WPCA 2D positions, ordered by avg x      |

---

## Deployment

Each parliament app deploys independently to Vercel:

| Setting          | Value                                                   |
|------------------|---------------------------------------------------------|
| Root directory   | `apps/cz-psp` (or `apps/cz-senate`, etc.)              |
| Build command    | `cd ../.. && pnpm build --filter=@legislature/cz-psp`   |
| Install command  | `pnpm install`                                          |

Environment variables:

| Variable            | Purpose                              |
|---------------------|--------------------------------------|
| `REVALIDATE_SECRET` | Token for `GET /api/revalidate`      |

Force data refresh (without redeployment):
```
GET https://snemovna.datatimes.cz/api/revalidate?secret=YOUR_SECRET
```

---

## `ParliamentConfig` reference

Defined in `packages/parliament-core/src/types.ts`.

### Top-level shape

```typescript
interface ParliamentConfig {
  id: string;               // "cz-psp"
  name: string;             // "Poslanecká sněmovna"
  defaultLang: string;      // "cs"
  dataBase: string;         // raw GitHub URL prefix for analysis JSONs
  analyses: string[];       // which analysis slugs exist in the data repo
  organizations: OrgTypeConfig[];
  translations: Record<string, ParliamentTranslations>;
  pages: {
    home: PageBlock[];
    memberDetail: PageBlock[];
    groupDetail: PageBlock[];
    regionDetail?: PageBlock[];
  };
}
```

### `OrgTypeConfig`

```typescript
interface OrgTypeConfig {
  classification: OrgClassification;  // "group" | "candidate_list" | "constituency"
  urlSegment: string;                  // "group"  (singular detail route)
  listUrlSegment: string;              // "groups" (list route)
  hasPage: boolean;                    // false = org exists in data but has no UI pages
  labels: Record<string, { singular: string; plural: string; listTitle?: string }>;
}
```

---

## Page block system

Pages are composed of **`PageBlock[]`** arrays defined in `parliamentConfig.pages.*`.
Each block carries its own type, translatable labels, and type-specific options.
`PageBlockRenderer` reads the array and renders the correct component for each block.

### `PageBlock` shape

```typescript
interface PageBlock {
  id: string;           // unique within page, e.g. "attendance-swarm"
  config: BlockConfig;  // discriminated union — see types below
  labels?: Record<string, {
    title?: string;       // section heading
    description?: string; // subtitle shown below heading
    content?: string;     // body text (for "text" blocks)
  }>;
}
```

### Block types

| `config.type`   | Component rendered          | Extra config fields                                      |
|-----------------|-----------------------------|----------------------------------------------------------|
| `swarm-chart`   | `MpMetricSwarmChart`        | `analysis`, `yMode?`, `yDecimals?`, `referenceLines?`   |
| `scatter-chart` | `WpcaScatterChart`          | `analysis: "wpca"`                                       |
| `metrics-grid`  | `MetricCard` row            | *(none — values come from `BlockRenderContext`)*         |
| `member-table`  | `SortableMpTable`           | `showPartyFilter?`                                       |
| `text`          | plain `<p>`                 | content via `labels[lang].content`                       |

### `PageBlockRenderer`

```tsx
<PageBlockRenderer
  blocks={parliamentConfig.pages.memberDetail}
  ctx={{
    lang: "cs",
    mps,             // MPs for charts (already filtered)
    parties,
    tableMembers,    // MPs for the table (may include former)
    highlightId,     // single MP highlight (member detail)
    highlightIds,    // set highlight (group detail)
    metricValues,    // pre-built metric card values (member/group/region detail)
  }}
/>
```

`metricValues` is constructed at the page level from `MpProfile` data + translated metric
labels from `parliamentConfig.translations[lang].metrics`.

### Adding a new block type

1. Add a new `XxxBlockConfig` interface with `type: "xxx-block"` in `packages/parliament-core/src/types.ts`
2. Add it to the `BlockConfig` union
3. Export it from `packages/parliament-core/src/index.ts`
4. Add a `case "xxx-block":` branch in `PageBlockRenderer.tsx`
5. Add the block to the relevant `pages.*` arrays in the parliament config
