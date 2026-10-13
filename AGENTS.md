# Repository Guidelines: Legislature Dashboard

## Overview & Apps
Turborepo monorepo for legislative and municipal dashboards.
- `apps/cz-psp`: Poslanecká sněmovna → [snemovna.datatimes.cz](https://snemovna.datatimes.cz)
- `apps/cz-cities`: Czech Municipalities (Prague, Brno, Plzeň, Ostrava, etc.) → [mesta.datatimes.cz](https://mesta.datatimes.cz)
- `apps/sk-nrsr`: Národná rada SR → [nrsr.datatimes.sk](https://nrsr.datatimes.sk)
- `apps/sk-cities`: Slovak Municipalities (Bratislava, Košice) → [mesta.datatimes.sk](https://mesta.datatimes.sk)

## Commands
```bash
pnpm dev          # Run apps in dev
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm typecheck    # Typecheck all packages
```

## Critical Rules & Constraints
1. **Preserve Untracked Git Files**:
   - NEVER stage, modify, or commit `apps/cz-cities/.gitignore` or `apps/cz-psp/.gitignore`.
2. **Lint Script Conventions**:
   - In Next.js app package.json files, use `"lint": "next lint"`.
   - Avoid `eslint .` in apps with flat config to prevent linting Next.js auto-generated `.next/types` files (e.g., triple-slash reference errors on `next-env.d.ts`).
3. **Deployment & DNS (Cloudflare + Vercel)**:
   - All subdomains (`mesta.datatimes.sk`, `mesta.datatimes.cz`, `nrsr.datatimes.sk`) pointing to Vercel deployments must have Cloudflare **Proxy status: DNS only (Grey cloud ☁️ OFF)** with CNAME pointing to `cname.vercel-dns.com` (or Vercel CNAME).
   - If Cloudflare Proxy is enabled (Orange cloud), Vercel SSL certificate provisioning fails and Cloudflare returns Error 525 (SSL Handshake Failed).
4. **Data Sources**:
   - Sourced from GitHub raw outputs:
     - CZ PSP: `michalskop/cz-psp-data-2025-202x`
     - SK Municipalities: `michalskop/sk-municipalities-votes-2022-2026`
5. **Vote Dashboard Performance**:
   - Read `docs/vote-dashboard-performance.md` before adding/copying a vote dashboard or changing its data loaders/rendering.
   - A vote-detail request must load only that event, never parse/rebuild the entire vote history.
   - Keep fetched/cacheable artifacts within an enforced byte budget; treat cache-size warnings as release failures.
   - Keep presentation-only layout switching in the browser, and verify actual ISR/cache hits for every public language route, including middleware rewrites.
   - Disable automatic vote-detail prefetching on long indexes unless its resource cost is measured and bounded.
