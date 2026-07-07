# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`legislature-dashboard` — dashboard for legislative data, starting with the Czech Lower Chamber (Poslanecká sněmovna) at snemovna.datatimes.cz. Future instances: Slovak parliament, European parliament.

## Monorepo structure

Turborepo + pnpm workspaces.

```
apps/
  cz-psp/        → Next.js app for snemovna.datatimes.cz (@legislature/cz-psp)
packages/
  ui/            → Shared React components (party badges, buttons) (@legislature/ui)
  charts/        → Shared visx chart components (@legislature/charts)
  utils/         → Shared utilities and formatters (@legislature/utils)
```

## Tech stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Charts**: visx (^3.12.0) — same as pollster-2026
- **Auth/Paywall**: Supabase (shared project with pollster-2026/mandaty.cz)
- **Deployment**: Vercel
- **CI**: GitHub Actions

## Design system

- Design tokens in `packages/ui/src/tokens.css` — color scales, semantic tokens, badge shape utilities
- Party colors in `apps/cz-psp/src/app/globals.css`
- Font: Roboto Slab (loaded via next/font)
- Badge shape: `rounded-badge` utility (all corners rounded except upper-right)
- Reference: pollster-2026 / mahdalova-skop.cz / mandaty.cz

## Data

Analysis outputs are fetched from `michalskop/cz-psp-data-2025-202x` via raw GitHub URLs.
Updated nightly via GitHub Actions in that repo.
Use Next.js server components with `revalidate` for ISR.

## Reference repos

- `michalskop/pollster-2026` (private) — primary reference for architecture, components, auth
- `michalskop/mandaty-2022` — visual design reference (Vue, not directly portable)
- `michalskop/cz-psp-data-2025-202x` — data source
- `michalskop/legislature-data-analyses` — analysis scripts
- `michalskop/legislature-data-standard` — data type schemas

## Guides

- [Adding a new parliament or language](./docs/adding-parliament-and-language.md)
- [Adding or updating an analysis](./docs/adding-or-updating-analysis.md) — dashboard part only; the
  canonical four-repo pipeline guide is
  [legislature-data-standard/docs/adding-an-analysis.md](https://github.com/michalskop/legislature-data-standard/blob/main/docs/adding-an-analysis.md)

## Commands

```bash
pnpm dev          # run all apps in dev mode
pnpm typecheck    # typecheck all packages
pnpm lint         # lint all packages
pnpm build        # build all packages
```
