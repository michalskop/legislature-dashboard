# Design system

Tokens are defined in `packages/ui/src/tokens.css` and imported via `@import "@legislature/ui/tokens.css"` in each app's `globals.css`.

- Shade `[6]` is the primary shade for each scale
- Font: Roboto Slab (loaded via next/font), injected as `--font-roboto-slab`
- Badge shape: `rounded-badge` utility — all corners rounded except upper-right (matches mahdalova-skop.cz / pollster-2026 / mandaty.cz)
- Reference: pollster-2026 / mahdalova-skop.cz / mandaty.cz — particularly the not-rounded top-right corner; apply consistently across the app

## Color scales

### surface — Background

| Token | Value |
|-------|-------|
| `surface-0` | `#ffffff` |
| `surface-1` | `#fdfbf7` |
| `surface-2` | `#f8f6f0` |
| `surface-3` | `#f3f1e9` |
| `surface-4` | `#eeeae2` |
| `surface-5` | `#e9e9dd` |
| `surface-6` | `#e8e8dc` |
| `surface-7` | `#d4d4c8` |
| `surface-8` | `#c8c8bc` |
| `surface-9` | `#bcbcb0` |

### brand — Primary Red

| Token | Value |
|-------|-------|
| `brand-0` | `#fff4f6` |
| `brand-1` | `#ffb3c0` |
| `brand-2` | `#ff8099` |
| `brand-3` | `#ff4d70` |
| `brand-4` | `#ff1a4a` |
| `brand-5` | `#f01745` |
| `brand-6` | `#de1743` ← primary |
| `brand-7` | `#c5143c` |
| `brand-8` | `#a81134` |
| `brand-9` | `#8b0e2b` |

### navy

| Token | Value |
|-------|-------|
| `navy-0` | `#e9ecf4` |
| `navy-1` | `#d2d8e9` |
| `navy-2` | `#bcc4df` |
| `navy-3` | `#a6b0d4` |
| `navy-4` | `#8f9dc9` |
| `navy-5` | `#7889be` |
| `navy-6` | `#6267a3` ← primary / muted-foreground |
| `navy-7` | `#4c4f8e` |
| `navy-8` | `#2f325c` |
| `navy-9` | `#101432` ← foreground / headings |

### teal

| Token | Value |
|-------|-------|
| `teal-0` | `#e5fdfc` |
| `teal-1` | `#b8eff6` |
| `teal-2` | `#8cdfef` |
| `teal-3` | `#5fcce6` |
| `teal-4` | `#33b9d9` |
| `teal-5` | `#1a9fbd` |
| `teal-6` | `#0e839e` ← primary |
| `teal-7` | `#06677d` |
| `teal-8` | `#044d5e` |
| `teal-9` | `#023440` |

### orange

| Token | Value |
|-------|-------|
| `orange-0` | `#fff3e8` |
| `orange-1` | `#ffe0c7` |
| `orange-2` | `#ffc89f` |
| `orange-3` | `#fda668` |
| `orange-4` | `#ff934d` |
| `orange-5` | `#ff7f2a` |
| `orange-6` | `#f76800` ← primary |
| `orange-7` | `#cc5f00` |
| `orange-8` | `#994800` |
| `orange-9` | `#663200` |

### yellow

| Token | Value |
|-------|-------|
| `yellow-0` | `#fffdf0` |
| `yellow-1` | `#fff7d9` |
| `yellow-2` | `#fff0b3` |
| `yellow-3` | `#ffe680` |
| `yellow-4` | `#ffdc33` |
| `yellow-5` | `#ffd519` |
| `yellow-6` | `#ffcf02` ← primary |
| `yellow-7` | `#efb704` |
| `yellow-8` | `#bd9103` |
| `yellow-9` | `#a47d03` |

### royal — Royal Blue

| Token | Value |
|-------|-------|
| `royal-0` | `#e9ebfa` |
| `royal-1` | `#c9d0f5` |
| `royal-2` | `#a9b5f0` |
| `royal-3` | `#899aeb` |
| `royal-4` | `#697fe6` |
| `royal-5` | `#5e66d5` |
| `royal-6` | `#4a51ab` ← primary |
| `royal-7` | `#383d82` |
| `royal-8` | `#272a59` |
| `royal-9` | `#161730` |

### coral

| Token | Value |
|-------|-------|
| `coral-0` | `#fff0ed` |
| `coral-1` | `#ffcec6` |
| `coral-2` | `#ffa99c` |
| `coral-3` | `#ff7e6e` |
| `coral-4` | `#ff5c4a` |
| `coral-5` | `#ff3f30` |
| `coral-6` | `#e8412c` ← primary |
| `coral-7` | `#c93020` |
| `coral-8` | `#a32318` |
| `coral-9` | `#7d1810` |

### deep-red

| Token | Value |
|-------|-------|
| `deep-red-0` | `#fbe8eb` |
| `deep-red-1` | `#f5c4c9` |
| `deep-red-2` | `#efa0af` |
| `deep-red-3` | `#e87c91` |
| `deep-red-4` | `#d85a74` |
| `deep-red-5` | `#bb3a5d` |
| `deep-red-6` | `#a03250` ← primary |
| `deep-red-7` | `#812840` |
| `deep-red-8` | `#621d30` |
| `deep-red-9` | `#431320` |

### emerald

| Token | Value |
|-------|-------|
| `emerald-0` | `#e8f9f4` |
| `emerald-1` | `#c2f0e4` |
| `emerald-2` | `#9be8d4` |
| `emerald-3` | `#75dfc4` |
| `emerald-4` | `#4fd6b4` |
| `emerald-5` | `#12b886` |
| `emerald-6` | `#0e926a` ← primary |
| `emerald-7` | `#0b6b4e` |
| `emerald-8` | `#084533` |
| `emerald-9` | `#042319` |

### forest

| Token | Value |
|-------|-------|
| `forest-0` | `#eaf7d6` |
| `forest-1` | `#cbeab1` |
| `forest-2` | `#acde8b` |
| `forest-3` | `#8dd265` |
| `forest-4` | `#6ec53f` |
| `forest-5` | `#639e0a` |
| `forest-6` | `#507e08` ← primary |
| `forest-7` | `#3d5f06` |
| `forest-8` | `#2a3f04` |
| `forest-9` | `#172002` |

### chocolate

| Token | Value |
|-------|-------|
| `chocolate-0` | `#f5f0eb` |
| `chocolate-1` | `#e6d5c3` |
| `chocolate-2` | `#d4b89e` |
| `chocolate-3` | `#c19a78` |
| `chocolate-4` | `#a87d58` |
| `chocolate-5` | `#8b6240` |
| `chocolate-6` | `#6e4a2c` ← primary |
| `chocolate-7` | `#53361e` |
| `chocolate-8` | `#3b2414` |
| `chocolate-9` | `#24150b` |

## Semantic tokens

| Token | Value | Maps to |
|-------|-------|---------|
| `primary` | `#de1743` | `brand-6` |
| `primary-foreground` | `#ffffff` | — |
| `background` | `#fdfbf7` | `surface-1` |
| `foreground` | `#101432` | `navy-9` |
| `muted` | `#f3f1e9` | `surface-3` |
| `muted-foreground` | `#6267a3` | `navy-6` |
| `border` | `#e8e8dc` | `surface-6` |
| `destructive` | `#de1743` | `brand-6` |
| `accent` | `#6267a3` | `navy-6` |

## Party colors (`apps/cz-psp/src/app/globals.css`)

| Token | Party | Value | Maps to |
|-------|-------|-------|---------|
| `party-ano` | ANO | `#272a59` | `royal-8` |
| `party-ods` | ODS | `#5e66d5` | `royal-5` |
| `party-spolu` | SPOLU | `#5e66d5` | `royal-5` |
| `party-kdu` | KDU-ČSL | `#ffcf02` | `yellow-6` |
| `party-top09` | TOP 09 | `#812840` | `deep-red-7` |
| `party-pirati` | Piráti | `#111111` | — |
| `party-stan` | STAN | `#ff1a4a` | `brand-4` |
| `party-spd` | SPD | `#a47d03` | `yellow-9` |
| `party-motoriste` | Motoristé | `#1a9fbd` | `teal-5` |
| `party-prisaha` | Přísaha | `#a9b5f0` | `royal-2` |
| `party-szs` | SZS | `#639e0a` | `forest-5` |
| `party-other` | other | `#bcbcb0` | `surface-9` |

## Badge shapes (`packages/ui/src/tokens.css`)

All corners rounded except upper-right — matches the physical badge aesthetic from mahdalova-skop.cz.

| Utility | Radius |
|---------|--------|
| `rounded-badge-sm` | `0.25rem 0 0.25rem 0.25rem` |
| `rounded-badge` | `0.375rem 0 0.375rem 0.375rem` |
| `rounded-badge-lg` | `0.5rem 0 0.5rem 0.5rem` |
| `rounded-badge-xl` | `0.75rem 0 0.75rem 0.75rem` |

## Sněmovna Digest (`/digest`)

Digest is a separate Next.js static-export app (repo: `michalskop/cz-psp-videoarchive`, subdir `web/`) served at `snemovna.datatimes.cz/digest` via a Next.js rewrite in `apps/cz-psp/next.config.ts` proxying to `cz-psp-videoarchive-michalskops-projects.vercel.app`.

The Digest uses the same color scales (brand, navy, teal, orange, yellow, surface) but defines only the variants it needs in `web/app/globals.css` — it does **not** import `@legislature/ui/tokens.css` (separate repo). Fonts differ: `--font-slab` (Roboto Slab) + `--font-sans` (Work Sans).

**Usage by role:**

| Role | Token |
|------|-------|
| Headings / foreground | `navy-9` |
| Muted text | `navy-6` |
| Highlights / primary | `brand-6` (crimson) |
| Controversies | `orange-6` |
| Video links / context | `teal-6` / `teal-0` |
| Logotype dot | `yellow-7` |
| Borders | `surface-6` |

**Components:**
- `HighlightCard` / `ControversyCard` — social-shareable cards with screenshot, speaker attribution, PSP logotype
- `VideoLink` — pill linking to PSP video archive with `#t=seconds` deep-link; subtle variant used inline in main-points list
- OG images pre-rendered at build time via `next/og` (`ImageResponse`) for every event page
- Category filter: toggle-off multi-select (all active by default, click to deactivate)
