# Design system

- Design tokens in `packages/ui/src/tokens.css` — color scales, semantic tokens, badge shape utilities
- Party colors in `apps/cz-psp/src/app/globals.css`
- Font: Roboto Slab (loaded via next/font)
- Badge shape: `rounded-badge` utility (all corners rounded except upper-right)
- Reference: pollster-2026 / mahdalova-skop.cz / mandaty.cz — particularly the not-rounded top-right corner; apply consistently across the app

## Sněmovna Digest (`/digest`)

Digest is a separate Next.js static-export app (repo: `michalskop/cz-psp-videoarchive`, subdir `web/`) served at `snemovna.datatimes.cz/digest` via a Next.js rewrite in `apps/cz-psp/next.config.ts` proxying to `cz-psp-videoarchive-michalskops-projects.vercel.app`.

Design specifics:

- Tailwind CSS v4 with its own DataTimes palette in `web/app/globals.css` — navy scale, teal (video links, context blocks), orange (controversies), brand/crimson (highlights)
- Fonts: Roboto Slab (slab) + Work Sans (sans) via Google Fonts
- `HighlightCard` / `ControversyCard` — social-shareable cards with screenshot, speaker attribution, PSP logotype
- `VideoLink` — pill button linking to PSP video archive with `#t=seconds` deep-link; subtle variant used inline in main-points list
- OG images pre-rendered at build time via `next/og` (`ImageResponse`) for every event page
- Category filter: toggle-off multi-select (all active by default, click to deactivate)
