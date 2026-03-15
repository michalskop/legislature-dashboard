# legislature-dashboard

Dashboard for legislative data, starting with the Czech Lower Chamber (Poslanecká sněmovna) at **[snemovna.datatimes.cz](https://snemovna.datatimes.cz)**.

A project by [KohoVolit.eu](https://kohovolit.eu) / [DataTimes.cz](https://datatimes.cz).

## Apps

| App | URL | Description |
|-----|-----|-------------|
| `apps/cz-psp` | snemovna.datatimes.cz | Czech Poslanecká sněmovna 2025–2029 |

## Packages

| Package | Description |
|---------|-------------|
| `packages/ui` | Shared React components — `PartyFace`, `PartyBadge`, design tokens |
| `packages/charts` | Shared visx charts — `SwarmPlot`, `ScatterPlot` |
| `packages/utils` | Shared utilities and formatters |

## Getting started

```bash
# Install dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Typecheck all packages
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build
```

Requires **Node.js 20+** and **pnpm 9+**.

## What it shows

For each MP and each party/kraj:

- **Účast na hlasování** — share of votes the MP attended
- **Rebelita** — how often the MP votes against their own parliamentary club
- **Vládnost** — how often the MP votes in line with the government coalition
- **Opravy hlasování** — number of corrected ("oops") votes
- **Ideologické pozice (WPCA)** — 2D map of MPs based on voting patterns

## Data

Analysis outputs are fetched from [`michalskop/cz-psp-data-2025-202x`](https://github.com/michalskop/cz-psp-data-2025-202x) via raw GitHub URLs. The data repo runs a nightly GitHub Action that recomputes all analyses from official [Poslanecká sněmovna open data](https://www.psp.cz/sqw/hp.sqw?k=1300).

The site uses Next.js ISR — pages are statically generated at build time and revalidated every hour.

### Force data refresh

```
GET https://snemovna.datatimes.cz/api/revalidate?secret=YOUR_SECRET
```

Set `REVALIDATE_SECRET` in Vercel environment variables.

## Deployment (Vercel)

| Setting | Value |
|---------|-------|
| Root directory | `apps/cz-psp` |
| Build command | `cd ../.. && pnpm build --filter=@legislature/cz-psp` |
| Install command | `pnpm install` |
| Output directory | `.next` |

Environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `REVALIDATE_SECRET` | Recommended | Secret token for `/api/revalidate` |

## Tech stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Charts**: visx
- **Monorepo**: Turborepo + pnpm workspaces
- **Deployment**: Vercel

## Related repos

- [`michalskop/cz-psp-data-2025-202x`](https://github.com/michalskop/cz-psp-data-2025-202x) — data source (nightly analyses)
- [`michalskop/legislature-data-analyses`](https://github.com/michalskop/legislature-data-analyses) — analysis scripts and methodology
- [`michalskop/legislature-data-standard`](https://github.com/michalskop/legislature-data-standard) — data type schemas
