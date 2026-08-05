# DIVERGENCE.md — apps/cz-cities vs apps/cz-psp

`apps/cz-cities` was created as a **third copy** of `apps/cz-psp` (per plan.md decision D4 —
speed over dedup; the shared-package refactor is deliberately deferred to audit task **T6**). This
file is intended to become T6's work order: every file below that says "identical, copied as-is"
is a duplication candidate; every file that says "diverges" documents exactly what's app-specific
vs what's boilerplate that a shared package/template could absorb.

This file now covers two tasks:

- **A1** (2026-08-04): scaffolded the app as a placeholder, single-city, cookie-language copy of
  `apps/cz-psp`. Section 1-4 below (mostly) describe that state.
- **A2** (2026-08-05, this update): replaced the single-city/cookie-language scaffold with real
  `/[lang]/[city]/...` routing, a `CityConfig[]` mechanism, and real Praha data. Section 5 covers
  what changed and why; sections 1-4 are kept but annotated `[A1, superseded by A2]` wherever A2
  replaced something.

Re-run to check drift against cz-psp for genuinely-shared boilerplate (note: A2 restructured the
route tree, so most path-level diffs below are now expected and not meaningful to re-diff
mechanically the way A1's flat `diff -rq` was):

```
diff -rq apps/cz-psp apps/cz-cities -x '.next' -x 'node_modules' -x '*.tsbuildinfo' -x '.turbo'
```

---

## 5. Task A2 — multi-city + multi-language routing (2026-08-05)

**The problem A1 left behind:** `apps/cz-cities` was architecturally single-city and
cookie-language-switched — `src/lib/lang.ts` called `cookies()` in `getLang()` (forces dynamic
rendering per request — audit T8), there was no `[city]` segment at all, and all data was fictional
placeholder fixtures. A2 replaces all three.

### 5.1 Routing restructure

Public URL shape (plan.md D5): `cs` is the default language and is served **unprefixed**; every
other language is prefixed. Cities are a path segment.

| URL | Meaning |
|---|---|
| `/` | Landing page, lists all configured cities (cs) |
| `/en` | Landing page (en) |
| `/praha` | Praha, Czech |
| `/en/praha` | Praha, English |
| `/praha/members`, `/en/praha/members` | Same pattern for every page |
| `/about`, `/en/about` | Site-wide "About" (not city-specific) |

Internally, the route tree is `src/app/[lang]/[city]/...` with `lang` **always present** — there is
no branch of the code that handles an unprefixed path. The public unprefixed `cs` URL exists purely
via `src/middleware.ts` **rewriting** (not redirecting) `/praha` → `/cs/praha` before the route
matches. This is the standard way to do "default locale unprefixed" without breaking static
generation: a rewrite is a routing-layer decision, not a per-request computation like the old
`cookies()` call, so Next.js still serves a statically-generated page through it. The middleware
also redirects (308) any request that explicitly hits `/cs/...` back to the unprefixed URL, so
there is exactly one canonical URL per (language, city, page) — no duplicate-content risk.

New/changed files:

- `src/middleware.ts` — rewrites bare paths to `/cs/...` internally, redirects explicit `/cs/...`
  requests to the unprefixed form, and (unchanged from A1, scoped down — see 5.6) does markdown
  content-negotiation + AI-discovery `Link` headers for `/` and `/about`.
- `src/app/[lang]/layout.tsx` — the **true root layout** (renders `<html lang={lang}>`/`<body>`)
  even though it lives under a dynamic segment. There is no sibling `src/app/layout.tsx` — Next.js
  allows the root layout to be the top-most segment folder's layout.tsx whether or not that folder
  is dynamic (the only other top-level branch, `src/app/api/*`, needs no layout since route
  handlers don't render React). This is what makes `<html lang={lang}>` real (not hardcoded, not
  cookie-derived) without breaking static generation. `generateStaticParams` returns exactly
  `LANG_CODES` (from `src/lib/i18n.ts`); `dynamicParams = false` makes any other `[lang]` 404.
- `src/app/[lang]/page.tsx` — the landing page (lists cities from `CITIES`).
- `src/app/[lang]/about/page.tsx` — site-wide About (uses `src/content/about.ts`, real content now).
- `src/app/[lang]/[city]/layout.tsx` — looks up `getCityConfig(citySlug)`, `notFound()`s if
  unconfigured, renders `SiteHeader`/`SiteFooter`/Matomo. `generateStaticParams` returns exactly
  `CITIES` (from `src/lib/city.config.ts`) for whatever `lang` the parent resolved to;
  `dynamicParams = false`. Together with `[lang]/layout.tsx`'s own `generateStaticParams`, this is
  the full (language × city) cross product the A2 acceptance checks require — nothing more.
- `src/app/[lang]/[city]/page.tsx`, `members/page.tsx`, `member/[id]/page.tsx`, `groups/page.tsx`,
  `group/[id]/page.tsx`, `vote-event/[id]/page.tsx`, `opengraph-image.tsx` — moved from the old
  `(site)/*` tree, updated to read `lang`/`city` from route `params` instead of `getLang()`/a
  singleton `parliamentConfig`. `member/[id]` and `group/[id]` each have their own
  `generateStaticParams({params: {lang, city}})` (Next.js's documented nested-static-params
  pattern — receives the parent's already-resolved params as a **plain object, not a Promise**;
  this tripped up an early draft, see git history) enumerating that city's real MPs/groups, with
  `dynamicParams = false`.
- `next.config.ts` — dropped the old flat `/poslanec/:id → /member/:id`-style redirects (A1 copied
  them from cz-psp; this app never had traffic under those paths, and with multi-city routing
  there's no single unprefixed target to redirect to anymore).

**`/region`, `/regions` — deleted, not kept vestigial.** A1's `DIVERGENCE.md` flagged this as an
open question for A2. Resolution: cities structurally never have a `constituency` organization —
confirmed architecture-wide (same as sk-nrsr), not a Praha-specific gap, so there is no future
config under which these routes would ever render real content. Deleted `regions/page.tsx`,
`region/[id]/page.tsx`, `KrajProfile`/`getAllKrajProfiles`/`getKrajProfile`/`constituencySlug`, the
`/kraj(e)` redirects, and all `regions.md`/region sitemap entries. `MpProfile.constituency` is now
always `null` for this app (the field itself is part of the shared `parliament-core` type and can't
be removed).

### 5.2 CityConfig mechanism

`ParliamentConfig` (from `@legislature/parliament-core`, read-only) is single-parliament-shaped —
no notion of "which city". `src/lib/city.config.ts` defines:

```ts
export type CityConfig = ParliamentConfig & { citySlug: string };
export const CITIES: CityConfig[] = [PRAHA];
export function getCityConfig(citySlug: string): CityConfig | undefined
export function getCitySlugs(): string[]
```

Adding a second real city (Brno, once plan.md C2-C5 land) is meant to be "append one `CityConfig`
object to `CITIES`" — no route file, component, or middleware code hardcodes `"praha"`. Only Praha
is populated: real data exists (C7/C8, owner sign-off DONE 2026-08-04); Brno/Ostrava don't have
working pipelines yet (`kod.brno.cz` was 503 during C1) — adding placeholder configs for them would
be premature per the task brief, so it wasn't done.

Every place that used to import the old singleton `parliamentConfig` now imports `getCityConfig`
(or receives a resolved `CityConfig` as a prop/param) instead. `src/lib/parliament.config.ts` is
deleted.

### 5.3 Language mechanism + dictionaries

`src/lib/i18n.ts` is the **one place** listing supported languages:

```ts
export const LANGS: LangDef[] = [{ code: "cs", default: true }, { code: "en" }];
```

Each city's `translations` map is assembled from **per-(city, language) dictionary files** under
`src/lib/dictionaries/` (`praha.cs.ts`, `praha.en.ts`) rather than inlined in `city.config.ts` — this
makes "add a language to an existing city" literally "add one dictionary file + one line
registering it in `city.config.ts`'s `translations` map + one line in `i18n.ts`'s `LANGS`", matching
the task's phrasing directly. See 5.7 for the from-scratch proof that this is actually true, not
just asserted.

`src/lib/site.ts` holds a small **separate** dictionary (`SITE_TRANSLATIONS`) for the two pages that
aren't scoped to one city (`/`, `/about`) — network-wide copy (site title, tagline, nav labels)
shouldn't live inside a per-city config.

`hreflang` alternates (`src/lib/metadata.ts`, `buildCityMetadata`/`buildGlobalMetadata`) are built
generically from `LANG_CODES` — adding a language automatically adds it to every page's `<link
rel="alternate" hreflang="...">` set with no per-page code change (verified in 5.7).

`src/lib/lang.ts` (cookie-based `getLang()`) is **deleted**. No file in this app calls `cookies()`
in the request path.

### 5.4 Real data instead of fictional placeholders

Real, owner-approved Praha data (plan.md C7/C8, D7 sign-off DONE 2026-08-04) replaces A1's fictional
fixtures, sourced from `/home/michal/dev/cz-municipalities-votes-2022-2026/praha/` (a separate local
repo, not pushed to GitHub yet — not fetched live, kept as committed local fixtures, same strategy
A1 used):

- `src/fixtures/praha/analyses/{attendance,rebelity,govity,wpca}/outputs/*.json` — the four real,
  schema-validated, owner-approved analysis outputs, copied verbatim.
- `src/fixtures/praha/data/{persons,organizations,memberships}.csv` — the real raw standard tables
  (66 councillors, 7 organizations — 1 assembly + 6 candidate-list, 132 membership rows).
- `src/data/vote-events/praha/{Z-10874,Z-12413,Z-14160}.json` — three real vote events (spanning
  2022-11-03, 2024-06-20, 2026-06-18) with real per-councillor votes, generated from the real
  `votes.csv`/`vote_events.json`. This mirrors `apps/cz-psp`'s own pattern: cz-psp's vote-event
  detail page also reads a small **curated, committed subset** of vote-event JSON files from
  `src/data/vote-events/` (5 files, not all ~2,300 vote events), not something fetched from the data
  repo — so this app now follows the same precedent with real Praha events instead of fictional
  ones, at the same (small) scale.
- `src/lib/parties.ts` — real Praha candidate-list slugs (`spolu-pro-prahu`, `ceska-piratska-strana`,
  `starostove-a-nezavisli`, `ano-2011`, `praha-sobe`, `spd-trik-pes-a-nez-pro-prahu`) replace the
  placeholder `placeholder-a/b/c` dictionary. Colors are a **functional, distinct palette, not
  official branding** — real per-city branding is task A3.
- `src/content/about.ts` — real "About" copy: Golemio open-data source, D7's candidate-list-fallback
  methodology, the real governing coalition (SPOLU pro Prahu + Česká pirátská strana + STAROSTOVÉ A
  NEZÁVISLÍ, since 2023-02-15) — replaces A1's generic "future scaffold" placeholder text.

`src/lib/data.ts`'s `fetchJson`-equivalent (`fetchAnalysisJson`/`readCityCsv`) still reads from local
disk, not the network — same reasoning as A1: `next build` runs data-fetching code at build time,
and no real data repo is published/stable enough to fetch from yet. `CityConfig.dataBase` documents
the future real URL shape; swapping to `fetch()` is still a small, isolated change in those two
functions, not a redesign.

#### 5.4.1 The current_members/current_groups gap — OPEN QUESTION FOR THE OWNER

`apps/cz-psp`'s data pipeline publishes `current_members.json`/`current_groups.json`/
`all_members.json` as **dedicated precomputed analyses**, fetched the same way as
attendance/rebelity/govity/wpca. **The city data pipeline (`cz-municipalities-votes-2022-2026`)
does not produce these** — it only publishes the four analyses plus the raw `persons`/
`organizations`/`memberships` standard tables. (There is a `praha/scripts/build_all_members.py` in
that repo, but it writes to `work/` — gitignored, regenerate-on-demand, an *input* to the analysis
scripts, not a published roster output.)

**Chosen approach for A2:** derive the same shape (`CurrentMember`/`CurrentGroup`) directly from the
raw tables, in this dashboard, at request time (`src/lib/data.ts`, `deriveAllMembers()` and
friends). A membership row with no `end_date` is "current" (matches the tables' own convention).
Candidate-list membership is dual-written into both `memberships.groups` and
`memberships.candidate_list` and reported as `classification: "group"`, mirroring exactly how the
city pipeline's own `build_all_members.py` and the four analysis outputs already model D7's
candidate-list-as-klub fallback (see e.g. `src/fixtures/praha/analyses/attendance/outputs/
attendance.json`: every person's `organizations` array has one `"group"` entry and one
`"candidate_list"` entry for the same org id).

**This is flagged, not silently resolved.** Open question for the project owner: should the city
data pipeline eventually publish `current_members`/`current_groups`/`all_members` as dedicated
analyses (mirroring PSP's precedent — same shape, one more analysis to keep in sync per city), or
should dashboards consuming this data repo always derive them from the raw tables the way
`src/lib/data.ts` now does (no pipeline change, but every consumer re-implements the same "no
end_date = current" + "candidate_list doubles as group" logic)? Neither option was picked here —
A2 implemented the derivation because *something* has to render the members list today, not because
it's obviously the right long-term architecture.

### 5.5 Component changes

- `src/components/LangSwitcher.tsx` — **real navigation**. Renders one `<Link>` per configured
  language pointing at the actual parallel URL (computed from `usePathname()`, stripping/adding the
  current language's prefix) — not a cookie write + `router.refresh()`.
- `src/components/NavLinks.tsx` — no longer contains its own duplicate cookie-based language
  `<select>` (A1 had this logic in *two* places — `LangSwitcher` and `NavLinks` both wrote the
  cookie independently); now renders `<LangSwitcher>`. Takes a resolved `CityConfig` instead of the
  old singleton; nav hrefs are built from `cityBasePath(lang, city.citySlug)`.
- `src/components/SiteHeader.tsx`/`SiteFooter.tsx` — take `lang`/`city` props instead of calling
  `getLang()`/importing the singleton config.
- `src/components/SiteHeaderGlobal.tsx`/`SiteFooterGlobal.tsx` — **new**, for the two pages that
  aren't scoped to a city (`/`, `/about`); simpler chrome (no members/groups nav), site-level
  translations only.
- `src/components/PageBlockRenderer.tsx` — `BlockRenderContext` gained a `basePath: string` field,
  threaded down to the chart components so their "click a dot → go to that member's page" callbacks
  build a city/lang-correct URL instead of a hardcoded `/member/...`.
- `src/components/MpMetricSwarmChart.tsx`, `WpcaScatterChart.tsx` — take a `basePath` prop, used in
  their `router.push()` callbacts. `AttendanceSwarmChart.tsx` **deleted** — confirmed via grep to
  have zero call sites (dead code already in A1; pages use `MpMetricSwarmChart` with
  `metric="attendance"` instead).
- `src/components/SortableMpTable.tsx` — no longer a bare re-export. `@legislature/ui`'s
  `SortableMpTable` (a Client Component) takes a `getMpHref(slug)` **function** prop. A Server
  Component cannot pass a function prop across the RSC server/client boundary (Next.js serializes
  props; functions aren't serializable unless marked `"use server"`) — an early draft that built
  `getMpHref` in a page component and passed it straight through `PageBlockRenderer` failed the
  production build with exactly this error. Fixed by making this local wrapper itself a Client
  Component (`"use client"`): it takes a plain, serializable `basePath: string` prop from its
  Server Component caller and builds the closure **on the client side of the boundary**, then
  passes it to the upstream component — a pure client-to-client prop pass, which is fine.

### 5.6 Scope trims (documented, not silent)

- The middleware's markdown content-negotiation (`Accept: text/markdown` → serve a `.md` mirror)
  is kept but scoped down to the two site-global pages (`/`, `/about`). A1's version also handled
  `/members`, `/groups`, `/regions` — those no longer have one universal path (they're
  `/<city>/members` etc., and `/regions` is deleted). Extending this to per-city, per-language
  markdown mirrors is left for a future task (A3/A4), not part of A2's routing-mechanism scope.
- `scripts/generate-ai-readability.mjs` (sitemap/llms.txt/robots.txt/agent-skills generator) is
  updated to iterate `CITIES × LANG_CODES` and read the new per-city fixture layout, but still only
  targets Praha (mirrors `CITIES`). It duplicates a small RFC4180 CSV parser rather than importing
  `src/lib/csv.ts`, because this script runs as plain Node ESM (the `prebuild` hook) without a TS
  loader — noted in a comment there, not hidden.
- Landing (`/`) and About (`/about`) pages have no Matomo tracking — `CityConfig.matomo` is
  per-city by design (D10 hasn't produced a real site ID yet either way), and there's no
  site-wide-vs-per-city analytics decision made in A2. Flagged, not resolved.

### 5.7 Dummy-language proof (`xx`) — done and reverted

To verify A2's central claim — "adding a language costs only config + one dictionary file, no code
changes" — a throwaway `xx` language was added purely via:

1. One line in `src/lib/i18n.ts`'s `LANGS` array (`{ code: "xx" }`).
2. One new dictionary file, `src/lib/dictionaries/praha.xx.ts` (obviously-fake content, e.g.
   `"XX-OVERVIEW"`, so it's unmistakable in a browser).
3. One line in `src/lib/city.config.ts`'s `translations` map (`xx: prahaXx`).

Verified, with real command output (not assumed):

- `curl /xx/praha` and `curl /xx/praha/members` → `200`, page body contains the `XX-...` markers
  (proves the dictionary is actually used, not silently falling back).
- `<link rel="alternate" hreflang="xx" .../>` appeared automatically in every page's `<head>` with
  no page-level code touched.
- `pnpm build` went from 158 to 235 statically generated pages (exactly the expected +77 for a third
  language across the city's member/group/home/members pages), and `/xx/praha`, `/xx/praha/members`,
  `/xx/praha/groups` all showed `●` (SSG) in the route table — the new language's pages are properly
  statically generated, not a dynamic fallback.
- An unconfigured code (`/yy/praha`) still `404`s throughout — the mechanism doesn't accidentally
  make *every* two-letter prefix work.

All three changes were then reverted (`git diff` after removal is empty for this — confirmed clean).
`/xx/praha` returns `404` again in both `pnpm dev` and a fresh `pnpm build`.

---

## 6. Owner screenshot review fixes (2026-08-05)

The project owner reviewed real screenshots of the A2 build and filed 8 findings. All are fixed
except item 4 (investigated, confirmed already correct, deliberately left unchanged). Two of the
fixes are **standing rules for every future city**, not Praha-only patches — see the two
call-out boxes below; both are also cross-referenced from the relevant source files.

1. **Party colors — real branding.** `src/lib/parties.ts`'s `PARTY_COLORS`/`PARTY_META` were a
   "functional, distinct" placeholder palette (5.4's own words). Replaced with the owner-supplied
   real colors: `spolu-pro-prahu #5e66d5`, `ano-2011 #272a59`, `ceska-piratska-strana #111111`,
   `starostove-a-nezavisli #ff1a4a` (all four copied from `packages/ui/src/components/
   PartyBadge.tsx`'s `CZ_PSP_PARTY_COLORS` — same party/coalition exists in Snemovna's own PSP
   data), `spd-trik-pes-a-nez-pro-prahu #a47d03` (Snemovna's SPD color — SPD is the lead party of
   that candidate list), and `praha-sobe #FFF021` (no Snemovna equivalent — sourced from the color
   swatch in Czech Wikipedia's 2022 Prague election-results page, read from the raw HTML's
   `style="background-color:#FFF021"`, not a text-only fetch which strips inline styles; given
   `darkText: true` like Snemovna's KDU-ČSL `#ffcf02`). `ano-2011`'s and
   `spd-trik-pes-a-nez-pro-prahu`'s old `darkText: true` were removed to match how Snemovna treats
   those same colors (no `darkText` there).

   > **Standing rule — party color lookup order, every future city:** (1) reuse Snemovna's color
   > if the same party/coalition exists there (`packages/ui`'s `CZ_PSP_PARTY_COLORS` — read-only,
   > copy the value, don't re-derive it); (2) else search Wikipedia's election-results page for
   > that city/term for an official color swatch — **fetch the raw page HTML**, not a text-only
   > fetch, since a text-only fetch strips inline `style="background-color:#..."` attributes;
   > (3) else ask the project owner. **Never invent a color.**

2. **Logotype text — missing diacritic.** Every exact-case occurrence of `Mesta.DataTimes.cz` (no
   diacritic) is now `Města.DataTimes.cz` (genitive plural, matches cz-psp's own
   `Sněmovna.DataTimes.cz`): `src/components/CityLogotype.tsx` (the actual rendered wordmark, not
   just its doc comment — this is the header/footer logo on every page), `src/lib/site.ts`,
   `src/lib/dictionaries/praha.cs.ts` (`seo.siteTitle`/`titleSuffix`), `src/content/about.ts`
   (cs+en intro), `src/app/[lang]/[city]/page.tsx` (JSON-LD `WebSite.name`),
   `src/app/[lang]/[city]/opengraph-image.tsx` (OG image fallback text),
   `scripts/generate-ai-readability.mjs` (source of the generated `public/llms.txt`, `index.md`,
   `about.md`, `.well-known/agent-skills/*` — regenerated via `node
   scripts/generate-ai-readability.mjs` after the fix, not hand-edited, since those files are
   build-generated), and the static `public/auth.md`. **Left alone, deliberately:** every
   already-lowercase `mesta.datatimes.cz` occurrence (the real domain in URLs, and the
   intentionally domain-style lowercase EN `titleSuffix` in `site.ts`/`praha.en.ts` — matching
   cz-psp's own EN convention of `snemovna.datatimes.cz`, no diacritics, since domains can't carry
   them) — the owner's ask was specifically the missing diacritic on the capitalized brand string,
   not a casing overhaul.

3. **Chart ordering by WPCA dimension 1.** `src/components/MpMetricSwarmChart.tsx`'s
   `sortedParties()` already computed each party's mean WPCA dim1 (`mp.wpca.x`, sourced from
   `praha/analyses/wpca/outputs/wpca.json`'s `dims[0]` via `src/lib/data.ts`) but sorted it
   **ascending**. Changed to **descending** per the owner's explicit instruction, so the highest
   mean-dim1 party sorts first/leftmost. `src/fixtures/praha/analyses/wpca/outputs/wpca.json` was
   already present and confirmed byte-identical to the source repo — no fixture copy was needed.
   Verified against real data: descending order gives ANO (mean +0.68) → SPOLU (+0.57) → SPD
   (+0.14) → STAN (+0.02) → Piráti (−0.81) → Praha sobě (−0.98), which is exactly what all three
   front-page swarm charts render post-fix (screenshot-verified). **Nuance for the owner:** the
   task's framing ("higher dim1 = coalition side") doesn't hold cleanly on the real numbers — ANO
   (opposition) has the *highest* mean dim1, ahead of coalition parties SPOLU/STAN. WPCA dim1
   apparently isn't a clean coalition/opposition axis on this dataset (plausibly because
   `govity`/coalition-alignment is ~100% for nearly every party — see the "Shoda s koalicí" chart —
   leaving little separating signal). The fix implements the literal, unambiguous instruction
   ("order by that aggregate, descending") rather than the informal parenthetical reasoning, since
   the two conflict on real data; flagging this rather than silently picking one.

4. **WPCA rotation check — confirmed correct, not changed.** The mayor, Bohuslav Svoboda
   (`praha:person:bohuslav-svoboda`), is already the rotation anchor in
   `praha/analyses/wpca/wpca_definition.json` (`rotate: {"voter_id":
   "praha:person:bohuslav-svoboda", "dims": [1,1,1]}`), and the committed `wpca.json` shows his
   `dims` as `[0.624, 0.162, 0.051]` — independently re-verified against the fixture, exact match.
   Positive/positive is mathematically quadrant 1, and `packages/charts/src/components/
   ScatterPlot.tsx`'s y-scale (`range: [yMax, 0]`) is correctly inverted so positive dim2 renders
   toward the visual top — screenshot-confirmed on `/praha/member/bohuslav-svoboda`'s WPCA scatter:
   his highlighted dot sits in the upper-right SPOLU cluster. **No code changed.** **Nuance flagged
   for the owner:** he's in the quadrant but not the extreme corner — dim2 (0.162) is modest, not
   large, so visually he reads as "upper-right-ish" rather than "far upper-right." A rotation can
   only flip axis signs, not change how spread out the data is, so if the owner wants him more
   visually prominent, that needs a different fix (e.g. axis scaling), not a rotation change — not
   attempted here since it wasn't asked for.

5. **Terminology — never "councillor".** Every English "councillor"/"councillors" in
   `apps/cz-cities/src` (case-insensitive grep, 41 matches across 8 files) is now "assembly
   member"/"assembly members": `src/lib/dictionaries/praha.en.ts` (nav, `member.*`, `ui.*`,
   `home.*`, `table.name`), `src/content/about.ts` (en paragraphs), `src/lib/city.config.ts` (en
   block descriptions + a code comment), `src/lib/data.ts` (a code comment), and
   `src/app/[lang]/[city]/page.tsx` (JSON-LD `variableMeasured`/`description`). Also fixed in
   `scripts/generate-ai-readability.mjs` (source of the generated `public/llms.txt`, `index.md`,
   agent-skill files — regenerated, not hand-edited). Czech dictionary/content already used
   "zastupitel/ka" throughout and needed no change.

   > **Standing rule — terminology, every city, every language, not Praha-only:** never render
   > "councillor"/"councillors" in English UI copy for any city dashboard. In Czech city
   > government the "rada" (executive council) is a distinct body from the "zastupitelstvo"
   > (elected assembly); "councillor" reads as a member of the former to an English speaker, which
   > is the wrong body. Use "assembly member"/"assembly members" — it pairs with this city's own
   > English org name ("Prague City Assembly", `home.title` in `praha.en.ts`); future cities should
   > pick the equivalent pairing for their own assembly's English name. See the comment above
   > `prahaEn` in `src/lib/dictionaries/praha.en.ts` for the same rule stated at the point future
   > translators will actually see it.

6. **& 7. Party badges inconsistent across pages.** Root cause: `@legislature/ui`'s `PartyFace`
   and `SortableMpTable` (`packages/ui/src/components/PartyFace.tsx`,`SortableMpTable.tsx`,
   read-only for this task) hardcode `CZ_PSP_PARTY_META`/`CZ_PSP_PARTY_COLORS` and
   `SK_NRSR_PARTY_META`/`SK_NRSR_PARTY_COLORS` directly, with no prop to inject a different party
   dictionary. They don't recognize this app's real Praha candidate-list slugs (e.g.
   `starostove-a-nezavisli`) and fall back to `partyId.toUpperCase()` inside a fixed-size SVG face
   — the illegible truncation the owner saw ("ANO-201…", "RATSKA"). The front-page charts never hit
   this bug because they don't use `PartyFace`/`PartyBadge` at all — they pass `iconColor`/
   `iconAbbr` straight into `@legislature/charts`' `SwarmPlot`/`ScatterPlot`, sourced from this
   app's own `PARTY_META`/`PARTY_COLORS` (`src/lib/parties.ts`).
   - **Confirmed affected, beyond the two pages the owner named:** every page importing `PartyFace`
     from `@legislature/ui` had the same bug — `/praha/members` (via `SortableMpTable`),
     `/praha/groups`, `/praha/group/[id]`, and `/praha/member/[id]`. The vote-event page
     (`/praha/vote-event/[id]`) was **already correct** — its `buildGroups()` already built
     `iconColor`/`iconAbbr`/`label` from this app's own `PARTY_META`/`PARTY_COLORS` via
     `groupIdToPartyId()`, the same pattern the charts use, and never touched `PartyFace`. Its
     colors only *looked* wrong before item 1's fix because the palette itself was a placeholder;
     screenshot-confirmed correct (SPOLU/ANO/Praha sobě/Piráti/SPD a další/STAN, real colors, no
     truncation) after items 1+6/7 landed.
   - **Fix:** `src/components/PartyFace.tsx` (new) — a visual/prop-compatible fork of
     `@legislature/ui`'s `PartyFace` reading from `src/lib/parties.ts` instead. Swapped into
     `groups/page.tsx`, `group/[id]/page.tsx`, `member/[id]/page.tsx`. `src/components/
     SortableMpTable.tsx` — was a thin wrapper around `@legislature/ui`'s `SortableMpTable`
     (needed only for a `getMpHref` closure, per the client/server-boundary note in 5.5); is now a
     full local fork of the same component (sorting, party filter, current/former split, `columns`
     prop — all unchanged), using the local `PartyFace` and `PARTY_META` instead of the upstream
     hardcoded dictionary. Screenshot-verified on `/praha/members`, `/en/praha/members`,
     `/praha/groups`, `/praha/group/starostove-a-nezavisli`, `/praha/member/bohuslav-svoboda`: all
     badges now show the same short abbreviations and colors as the front-page charts (SPOLU, ANO,
     PIR, STAN, PS, SPD).
   - **`classification: "group"` vs `"groups"` investigation (owner's specific hypothesis):**
     real, but a red herring, not the cause. `wpca.json`'s per-person `organizations[]` entries do
     say `"classification": "groups"` (plural) while `attendance.json`/`rebelity.json`/
     `govity.json` say `"group"` (singular) for the equivalent entry — confirmed by direct
     inspection of both fixture files. But `src/lib/data.ts`'s `getAllMpProfiles()` only reads
     `classification` off `attendance` records (`a.organizations.find(o => o.classification ===
     "group")`, singular — matches attendance.json correctly) to derive `groupId`/`partyId`; it
     never reads `wpca`'s `organizations[].classification` at all (only `wpca.dims`/`weight`/
     `included`/`person_id`). The plural/singular mismatch is real and worth normalizing upstream
     for hygiene, but it has no effect on anything this app renders.

8. **Front-page charts undercounting mid-term departures.** Confirmed root cause:
   `src/app/[lang]/[city]/page.tsx` passed `allMps.filter(m => m.isCurrent)` to the front-page
   swarm/scatter charts. `isCurrent` (from `src/lib/data.ts`'s `isCurrent()`, `end_date === null`
   on the parliament membership interval) is false for STAN's David Procházka (left
   2025-03-27, real/documented), so he was silently dropped from the charts even though
   `attendance.json`/`rebelity.json`/`govity.json`/`wpca.json` already correctly include him (5
   STAN members total, `included: true`, real `dims`) — confirmed by direct inspection before
   changing anything. **Fix:** `page.tsx` now passes the unfiltered `allMps` to
   `PageBlockRenderer`'s chart context; `currentMps` (still `isCurrent`-filtered) is kept only for
   the JSON-LD dataset's `currentMpCount` — a legitimate, different use of "current" (how many sit
   today), left untouched, same as the members-page current/former split. **Verified
   programmatically, not just visually:** counted `<g>` (dot) elements inside the STAN column of
   the rendered attendance chart's SVG via a headless-browser DOM query — 5 dots (previously would
   have been 4), matching all 6 parties' dot counts (15+19+3+5+13+11 = 66) against the wpca.json
   per-party member counts exactly.

---

## 7. WPCA government-axis detection + govity y-axis fix (2026-08-05)

Two more real issues found by the project owner reviewing rendered charts, investigated and
quantified in a prior session (root causes confirmed independently — see the two verification
sub-sections below), fixed in this session.

### 7.1 Issue: §6 item 3's "dim1 = coalition axis" assumption was wrong

`wpca.json`'s three unsupervised WPCA dimensions don't have a fixed political meaning — which one
correlates with real government/opposition membership emerges from the vote data itself, and can
differ by term or shift mid-term if the coalition changes. §6 item 3 (above) hardcoded `dims[0]`
(`mp.wpca.x`) as "the coalition axis" and even flagged its own nuance: *"the task's framing
('higher dim1 = coalition side') doesn't hold cleanly on the real numbers — ANO (opposition) has
the highest mean dim1, ahead of coalition parties."* That nuance was the tell: `dims[0]` was never
the right axis for this term. `dims[1]` is.

**Detection, not assumption.** `cz-municipalities-votes-2022-2026` (the separate local data repo
this app reads fixtures from) gained
`praha/scripts/detect_government_axis.py`: for each `wpca.json` dims[] index, it computes the
point-biserial correlation (Pearson correlation with a 0/1 government-membership label — a
standard, bounded [-1,1] statistic) against real government membership, expanded from
`govity_definition.json`'s `government_groups` via `memberships.csv`. It writes a sidecar,
`praha/analyses/wpca/outputs/government_axis.json` — **not** a change to `wpca.json` itself, which
is schema-validated (gate G1) and would risk breaking on an undeclared field.

**Independently re-verified in this session** (re-run from the committed `wpca.json`/
`govity_definition.json`/`memberships.csv`, not taken on faith):

| dims[] index | point-biserial r |
|---|---|
| 0 | 0.0088 |
| **1** | **0.9452** |
| 2 | 0.0016 |

`dims[1]` wins by a wide margin — confirms the prior session's finding almost exactly (it had
quoted per-party means consistent with these numbers, e.g. Piráti +0.49/STAN +0.26/SPOLU +0.24 on
the government side — this session's exact re-computation: Piráti +0.491, STAN +0.255, SPOLU
+0.241, same trio of values, order-of-listing differed slightly in the prior note but the
underlying numbers match to 3 decimal places). `wpca_definition.json`'s existing rotation anchor
(`praha:person:bohuslav-svoboda`, a government-coalition member) already happens to put government
positive on `dims[1]` (government_mean=+0.33, opposition_mean=-0.47) — **no rotation change was
needed**, confirmed and now documented in `wpca_definition.json`'s `extras`, not silently assumed.
A manual-override escape hatch (`extras.government_axis_override`, `null` by default) was added to
`wpca_definition.json` for a future case where auto-detection picks the wrong dimension.

**This app now consumes that sidecar generically — no hardcoded dimension index anywhere in
`apps/cz-cities`:**

- `src/fixtures/praha/analyses/wpca/outputs/government_axis.json` — new fixture, copied verbatim
  from the source repo (same fixture strategy as every other analysis output — see §5.4).
- `src/lib/types.ts` — new `GovernmentAxisRecord` type; `WpcaRecord.dims`'s doc comment no longer
  claims `dims[0]=x, dims[1]=y`.
- `src/lib/data.ts` — new `fetchGovernmentAxis()`; `getAllMpProfiles()`'s new `pickWpcaAxes()`
  reads `government_axis.json`'s `effective_dim_index` for `x` and picks whichever *remaining*
  dimension has the next-highest `|correlation|` for `y` (handles `n_dims > 2` generically — the
  2D scatter can only show two axes, so "the other one" means the most-informative of what's left,
  not a fixed second index). This is the **one place** the dimension mapping happens; every
  component downstream just reads `mp.wpca.x`/`mp.wpca.y` as before.
- `src/components/WpcaScatterChart.tsx` — x renders as the horizontal axis (unchanged prop
  wiring — `x`/`y` were already mapped to the scatter's horizontal/vertical, only *which raw
  dimension* feeds `x` changed, in `data.ts`), labeled "◄ ◄ ◄ Koalice | Opozice ► ► ►" (same text
  as before — it's now actually correct, since `x` is now actually the government axis). The `y`
  axis's default label and both `src/lib/dictionaries/praha.{cs,en}.ts`'s `charts.wpca.yLabel`
  changed from "Rozdíly v rámci koalice nebo opozice" / "Differences within coalition or
  opposition" (a directional claim that no longer holds — `y` is just whatever's left, weakly
  correlated with government at best) to neutral text: "Jiná dimenze hlasování" / "Other voting
  dimension". No sign flip was applied to either axis (deliberately — the task explicitly did not
  ask for one, and §6 item 4 already established "don't add a flip you don't need"): `x`/`y` are
  the raw `dims[]` values at their detected/next-best indices, nothing more.
- `src/components/MpMetricSwarmChart.tsx`'s `sortedParties()` needed **no logic change** — it
  already sorted by `mp.wpca.x` descending (§6 item 3's fix), and `x` is now correct by
  construction via `data.ts`. Only its doc comment changed, to stop claiming a hardcoded `dims[0]`/
  "dim1" and describe the sidecar-driven mapping instead.

**Verified against real data, post-fix:** descending by (now-correct) `mp.wpca.x` gives Piráti
(+0.49) → STAN (+0.26) → SPOLU (+0.24) → ANO (−0.36) → SPD a další (−0.57) → Praha sobě (−0.60) —
government parties first/leftmost, opposition last/rightmost, cleanly separated with no overlap
(unlike the old `dims[0]` ordering, where ANO/SPOLU/SPD were interleaved with STAN and Piráti was
the single most negative party despite being in government). Screenshot-confirmed on the front page
and a group detail page (see below): the WPCA scatter's horizontal axis now cleanly separates
SPOLU/Piráti/STAN from ANO/Praha sobě/SPD, left↔right, with no cross-cluster overlap.

**Scope note, carried over from the source repo:** axis-detection is implemented in
`cz-municipalities-votes-2022-2026` only (`praha/scripts/detect_government_axis.py`), not in the
shared `legislature-data-analyses` repo. Generalizing it there (so `wpca.py` itself could emit this
sidecar for every city/parliament, not just something each downstream data repo re-implements) is a
bigger change worth its own review — flagged again here, still not attempted.

### 7.2 Issue: govity swarm chart's y-axis hid real spread behind a 0–120% domain

`govity` (share of votes cast in line with the government) genuinely clusters near 100% for almost
every party — real, not a calculation artifact: Prague's assembly votes near-unanimously on most
routine business (grants, appointments, procedural items), and real political contestation is
concentrated in a minority of votes. (A prior session found one small real formula quirk — the
shared `govity.py` counts abstaining as government agreement, already tracked as the source repo's
own audit task T17a — but quantified it at only ~2.2 percentage points of the effect, not the
dominant cause; **explicitly not touched here**, per the owner's decision to fix only the chart's
scaling, not the shared analysis script.)

The bug was purely presentational: `MpMetricSwarmChart`'s `yMode="auto"` always floors the y-domain
at 0 and only pads the *top* (`niceUpperBound`, ~+15% then rounded to a nice step) — for govity's
real range (individual members ~97.9–100%, party means ~98.7–100%), that produces a 0–120% domain,
squeezing the entire real spread into the top ~15% of the chart and making every party look
identically pinned at 100%.

**Fix — `src/components/MpMetricSwarmChart.tsx`:** a new `niceLowerBoundToCeiling()` floors the
y-domain a little (2 percentage points) below the real per-person minimum, on a fixed 100% ceiling
(govity is a vote-agreement share — it structurally cannot exceed 1, so no top padding is needed
the way `niceUpperBound` pads for rebelity's unbounded-ish range). This is applied via a
`metric === "govity"` special case in the component, not a new `yMode` value — the shared
`SwarmChartConfig.yMode` type (`packages/parliament-core`, read-only for this task) only allows
`"full" | "auto"`, so a third mode literal wasn't available without touching `packages/*`.
Data-driven (computed from the real min at render time) rather than a hardcoded fixed floor like
"85%", so it stays robust if a future term's or city's govity spread turns out wider or narrower
than Praha's current one. `attendance`/`rebelity`'s own `yMode`-driven scaling is completely
untouched — the branch is metric-specific. `src/lib/city.config.ts`'s two `govity-swarm` blocks
still say `yMode: "auto"` (harmless — now overridden by the metric check) with a comment explaining
why, rather than silently leaving a misleading config value unexplained.

**Verified against real data:** Praha's committed `govity.json` — individual members range
97.88%–100%, party means range 98.68% (SPD a další) to 99.98% (STAN). The new domain floors at 96%
(2pp below the 97.88% individual min, per `niceLowerBoundToCeiling`), giving `[0.96, 1.0]` — the
real spread now occupies about half the chart's height instead of the top ~15%. Screenshot-
confirmed below: coalition parties (STAN/SPOLU/Piráti) visibly cluster nearer the top, opposition
(ANO/Praha sobě/SPD a další) visibly lower, no longer a flat line.

### 7.3 Verification

- Screenshots taken with Playwright (system Chromium) against a freshly built + started
  `next start` server on a confirmed-free port (verified via `ss -tlnp` before start, and the
  server's own log confirmed `Ready` before navigating) — front page and a group detail page, `cs`.
- `pnpm typecheck`, `pnpm lint`, `pnpm build --filter=@legislature/cz-cities` all pass (see repo
  history for this session's commit for the exact output).

---

## 8. Owner feedback round two (2026-08-05) — partial reversal of §7's axis remapping + 3 more fixes

Four more owner findings, fixed in this session. Item (a) below is a deliberate **partial reversal**
of §7's design: §7 made the WPCA scatter's raw `x`/`y` mapping dynamic (swap dims so the
government-separating dimension is always horizontal). The owner asked to stop doing that — `x`/`y`
are fixed again (`x=dims[0]`, `y=dims[1]`), but the *axis label* placement §7 also introduced (read
`government_axis.json`'s `effective_dim_index` to know which axis is the government axis) is kept,
just repointed from data-mapping to label-placement.

### 8 (a) WPCA scatter — fixed x=dims[0]/y=dims[1], correct label placement

`src/lib/data.ts`: removed `pickWpcaAxes()` (the §7 function that read `effective_dim_index` to
decide which `wpca.json` dims[] index fed `x` vs `y`). `getAllMpProfiles()`'s `wpca` field is now
always `{ x: w.dims[0] ?? 0, y: w.dims[1] ?? 0, ... }` — no dimension swapping, ever. Added
`isGovernmentAxisOnX(citySlug)`, a small exported helper (`fetchGovernmentAxis(citySlug).then(a =>
a.effective_dim_index === 0)`) — this is the **only** remaining consumer of `effective_dim_index`,
and it's read purely for chart *label* placement, never for data remapping.

Praha's `government_axis.json` has `effective_dim_index: 1` (point-biserial r=0.945 on dims[1] vs
~0.01/0.002 on dims[0]/dims[2] — already established in §7, re-used here, not re-derived), so for
this term `isGovernmentAxisOnX("praha")` resolves `false`: the government/opposition axis is `y`,
not `x`.

`src/lib/dictionaries/praha.{cs,en}.ts`'s `charts.wpca.xLabel`/`yLabel` text strings are unchanged
("Koalice | Opozice" / "Jiná dimenze hlasování" and EN equivalents) — they're now read as "the
government-axis label text" and "the other-axis label text" respectively, not "the label that
literally goes on x" / "...on y". The three page components that build `chartLabels` for
`PageBlockRenderer` (`src/app/[lang]/[city]/page.tsx`, `member/[id]/page.tsx`, `group/[id]/page.tsx`)
now each fetch `isGovernmentAxisOnX(citySlug)` alongside their other data and swap which dictionary
string becomes `wpcaXLabel` vs `wpcaYLabel` accordingly:

```ts
chartLabels: {
  average: t.charts.average,
  wpcaXLabel: govAxisOnX ? t.charts.wpca.xLabel : t.charts.wpca.yLabel,
  wpcaYLabel: govAxisOnX ? t.charts.wpca.yLabel : t.charts.wpca.xLabel,
},
```

For Praha this term, that means "Koalice | Opozice" renders on **y**, "Jiná dimenze hlasování" on
**x** — the reverse of §7's placement (which had put it on x because x itself was the remapped
government dimension back then). `src/components/WpcaScatterChart.tsx` needed no logic change, only
a doc-comment update (it already just renders whatever `xLabel`/`yLabel` props it's given on
whichever axis); `src/lib/data.ts`'s doc comments and `WpcaRecord.dims`' comment in `src/lib/types.ts`
were updated to stop describing the now-removed dynamic mapping.

**Verified against real data, post-fix:** screenshots (`pnpm exec next start`, confirmed-free port,
server's own `Ready` log checked first — Chromium headless via `--virtual-time-budget` since no
Playwright install in this repo) of the front page (`cs` and `en`) show the vertical "▲▲▲ Koalice |
Opozice ▼▼▼" / "Coalition | Opposition" label on the **y** axis, "Jiná dimenze hlasování" / "Other
voting dimension" on **x** — and government parties (Piráti, STAN, SPOLU) cleanly separate into
positive-y from opposition (ANO, SPD a další, Praha sobě) in negative-y, no cross-cluster overlap,
matching §7's previously-established separation just on the other axis now.

### 8 (b) Swarm chart party ordering — ascending by dim1 (mp.wpca.x, now fixed)

`src/components/MpMetricSwarmChart.tsx`'s `sortedParties()` comparator changed from `bW - aW`
(descending) back to `aW - bW` (ascending) — lowest mean `mp.wpca.x` first/leftmost, highest
last/rightmost. Since (a) above fixed `mp.wpca.x` to always be mean dims[0] (no more per-term
dynamic remapping), this ordering is now stable/predictable across terms in a way §7's version
(ordering by whatever the *current* government axis happened to be) wasn't.

**Verified against real data:** ascending by dims[0] gives Praha sobě (−0.978) → Piráti (−0.814) →
STAROSTOVÉ A NEZÁVISLÍ (+0.019) → SPD,Trik.,PES a nez. pro Prahu (+0.144) → SPOLU pro Prahu (+0.571)
→ ANO 2011 (+0.682) — screenshot-confirmed on the front page's attendance/rebelity/govity swarm
charts and a member-detail page's swarm chart (column order PS, PIR, STAN, SPD, SPOLU, ANO
left-to-right in all cases): SPOLU lands 5th of 6 (right half), matching its position on the WPCA
scatter's right side (x≈+0.57), exactly as expected.

### 8 (c) Removed the "Opravy hlasování" (vote corrections) column from the members table

`src/components/SortableMpTable.tsx` (the local, full fork of `@legislature/ui`'s
`SortableMpTable` — forked for the party-dictionary reasons documented in §6 items 6/7, not
re-explained here): `SortKey`/`MetricColumn` no longer include `"corrections"`, `ALL_METRIC_COLUMNS`
dropped it, `getNumericValue()`'s `"corrections"` case removed, the header `<Th>` and the `<td>` cell
both removed. The now-last `govity` column's `<td>` lost its trailing `pr-4` to match the table's
existing "no right padding on the last column" convention (previously `corrections` held that spot).

The `columns` prop is still typed against the **wider** shared shape
(`Array<"attendance"|"rebelity"|"govity"|"corrections">`, matching
`@legislature/parliament-core`'s read-only `MemberTableBlockConfig["columns"]`) for prop-shape
compatibility with `PageBlockRenderer`'s `columns={tc.columns}` pass-through, but any `"corrections"`
value is filtered out before use — this app's local `MetricColumn` type (and therefore anything
actually rendered) never includes it.

`src/lib/data.ts`'s `voteCorrections: null` (already hardcoded, see §5.4's "vote-corrections
deliberately not fetched" note) was **not** removed — checked, and it's not "completely unused":
`src/app/[lang]/[city]/member/[id]/page.tsx` still reads `mp.voteCorrections` to build a
`metricValues.corrections` object for a `metrics-grid` block. That object is always `undefined` in
practice (since `voteCorrections` is always `null`), so the corrections `MetricCard` never actually
renders on the member page either — it was already silently inert before this fix, just via a
different code path (a `metrics-grid` block, not the table) than the one the owner flagged. Left
as-is since it's out of scope for "the members table" specifically and not user-visible; flagged
below as still open. `MpProfile.voteCorrections`'s type itself (from `@legislature/parliament-core`,
read-only) is a required, non-optional field — can't be removed even if it became fully unused.

**Verified:** screenshot of `/praha/members` — header row is Zastupitel/ka, Klub, Účast, Rebelování,
Shoda s koalicí (5 columns, no corrections). `/en/praha/members` likewise has no "Vote corrections"
column.

### 8 (d) Member/group detail pages undercounted party rosters — same bug as §6 item 8, not yet propagated

§6 item 8 fixed the front page's charts to use every member who ever held a seat during the term
(`allMps`, unfiltered), not just currently-sitting members (`isCurrent`-filtered), because
`isCurrent` silently drops mid-term departures even though the analysis outputs already correctly
include them. That fix was never applied to the member-detail or group-detail pages, which had the
identical bug:

- `src/app/[lang]/[city]/member/[id]/page.tsx`: `const chartMps = allMps.filter((m) => m.isCurrent ||
  m.personId === mp.personId);` → `const chartMps = allMps;` (the `|| personId ===` fallback is
  unnecessary once the list is unfiltered — it already contains everyone, current or former).
- `src/app/[lang]/[city]/group/[id]/page.tsx`: `const currentAllMps = allMps.filter((m) =>
  m.isCurrent);` and `const memberIds = members.filter((m) => m.isCurrent).map((m) => m.personId);`
  → `const chartMps = allMps;` and `const memberIds = members.map((m) => m.personId);` (renamed
  `currentAllMps` → `chartMps` since it's no longer current-only, matching the member page's naming).

**Explicitly not touched**, per the task brief (owner-confirmed correct in an earlier round):
`src/app/[lang]/[city]/groups/page.tsx`'s `currentParties`/`formerParties` split (the groups
*overview* page's headcount — "how many members does this group have right now", a legitimately
different, current-only question) and the member-detail page's own `!mp.isCurrent` "former member"
badge (about whether *that page's subject* is current/former, not a list-filtering question).

**The real case that exposed this:** SPD,Trik.,PES a nez. pro Prahu has 3 members total across the
term — Milan Urban, Zdeněk Seidl (both current), and **Josef Nerušil** (`praha:person:josef-nerusil`,
membership `2022-11-03` – `2026-03-26`, per `src/fixtures/praha/data/memberships.csv`) — but only 2
are current. Before this fix, Josef Nerušil's own member-detail page rendered its SPD swarm/scatter
charts using only the 2 current SPD members (missing himself, even on his own page, since the old
`isCurrent || personId === mp.personId` fallback only patched around this on his own page, not on
`/praha/group/spd-trik-pes-a-nez-pro-prahu`, which had no such fallback and simply dropped him from
every chart entirely). After the fix, his own page's SPD swarm column and the group page's WPCA
scatter both include him (verified: all three of his, Urban's, and Seidl's WPCA `dims` — index 0
values 0.134/0.155/0.144, index 1 values −0.524/−0.650/−0.540 — are near-identical, so their three
scatter dots visually overlap almost completely, which is why only ~2 distinct squares are visible
by eye; confirmed programmatically instead, by checking `josef-nerusil` appears in the rendered
page's data payload for both pages, not just visually).

**Verified, `/praha/groups` unaffected (as intended):** the groups overview still shows "SPD,Trik.,
PES a nez. pro Prahu — 2 zastupitelů" (current-only headcount, untouched) and "STAROSTOVÉ A
NEZÁVISLÍ — 4 zastupitelů" (also current-only) even though the front page's own charts (§6 item 8,
unaffected by this session) correctly plot 5 STAN members including the departed David Procházka —
same "two legitimate, different current-vs-all-time questions coexisting" pattern as before, now
consistently applied across the front page, member-detail page, and group-detail page's charts (all
all-time) vs. the groups-overview page's headcount card (current-only).

### 8.1 Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm build --filter=@legislature/cz-cities` all pass (only
  pre-existing warning: `MatomoScript.tsx`'s unused `url`/`siteId` params, unrelated to this
  session's changes).
- Screenshots taken against a freshly built + `next start` server, port confirmed free via `ss -tlnp`
  first, server's own log confirmed `Ready` before navigating (system Chromium headless, since no
  Playwright package is installed in this repo — `--virtual-time-budget`/
  `--run-all-compositor-stages-before-draw` used to let the client charts hydrate/render before the
  screenshot, since a plain `--screenshot` without those flags captured the page before D3/React
  hydration painted the SVGs).
- Front page (`cs` + `en`): swarm charts confirmed ascending PS→PIR→STAN→SPD→SPOLU→ANO,
  SPOLU in the right half; WPCA scatter's "Koalice | Opozice"/"Coalition | Opposition" label
  confirmed on the y axis, government parties (SPOLU/Piráti/STAN) cleanly separated from opposition
  in positive-y.
- `/praha/members`, `/en/praha/members`: confirmed no vote-corrections column.
- `/praha/member/josef-nerusil`: confirmed "Bývalí zastupitelé" (former member) badge with the
  correct 3.11.2022–26.3.2026 mandate dates, and his own SPD swarm chart column now includes 3
  members (himself + Urban + Seidl) instead of 2.
- `/praha/group/spd-trik-pes-a-nez-pro-prahu`: confirmed header still says "2 zastupitelů" (current
  headcount, untouched) while the "Členové klubu" table and WPCA scatter both include Josef Nerušil
  under a "Bývalí zastupitelé" sub-section.
- `/praha/groups`: confirmed unaffected — same current-only headcounts as before this session.

---

## Notes for T6 (future de-duplication refactor) — updated for A2

- `@legislature/ui`'s `PartyBadge`/`PartyFace`/`SortableMpTable` still hardcode `CZ_PSP_PARTY_*` and
  `SK_NRSR_PARTY_*` dictionaries by name (unchanged by A2 — `packages/*` is read-only for this
  task). This app's `src/lib/parties.ts` workaround now uses real Praha IDs instead of
  `placeholder-a/b/c`, which if anything makes the T6 case stronger: a third, real, differently-
  shaped ID namespace (`spolu-pro-prahu` etc., not `psp:org:1750`-style numeric IDs) is now hitting
  the same hardcoded-dictionary wall.
- **T6 case got materially stronger in the owner-review pass (section 6, items 6/7):** what A2 (and
  A1 before it) treated as "chart components read `PARTY_META`/`PARTY_COLORS` directly, no big
  deal" turned out to be a real, visible bug once `@legislature/ui`'s `PartyFace`/`SortableMpTable`
  got used on non-chart pages (members table, group/member detail) — they silently render
  illegible badges for any non-PSP/non-SK-NRSR party ID, with no error, no fallback warning. The
  fix added **two more full local forks** — `src/components/PartyFace.tsx` and a fully-forked (not
  thin-wrapped) `src/components/SortableMpTable.tsx` — specifically because `packages/ui` has no
  prop to inject a custom party dictionary into either component. When T6 lands, the fix is
  probably "`PartyBadge`/`PartyFace`/`SortableMpTable` take an optional `partyMeta`/`partyColors`
  prop (defaulting to the current hardcoded PSP dict for back-compat)", which would let this app
  (and cz-psp/sk-nrsr) delete their local forks/`parties.ts` workaround entirely — worth scoping
  T6 to fix this specific gap first, since it's now the only thing forcing two of cz-cities' three
  duplicated table/badge components to exist at all.
- The `/region`, `/regions` routes A1 flagged as "T6 or A2 should decide" are **now deleted** (see
  5.1) — resolved, not deferred.
- `src/lib/lang.ts`'s cookie-based `getLang()`, flagged by A1 as "A2 replaces this", is **now
  deleted** (see 5.3) — resolved, not deferred. No app-level T8 remnant remains in cz-cities.
- New T6 candidate surfaced by A2: `src/app/[lang]/layout.tsx`'s "root layout lives at the top
  dynamic segment" pattern, `src/middleware.ts`'s rewrite/redirect logic, and the
  `LANGS`/`CityConfig`/dictionary-file mechanism in `src/lib/i18n.ts`/`city.config.ts`/
  `dictionaries/` are all designed to be **the template** other-country dashboards copy (per plan.md
  A2's framing: "the template part — this design gets ported to other countries"). If/when T6 lands,
  this i18n mechanism (not just the boilerplate components) should move into whatever shared
  package/template T6 produces, since it's the part explicitly meant to be reused, not just
  deduplicated.

---

## 1. Identical, copied as-is [A1 — mostly superseded by A2's restructure]

At A1 time, these files were byte-for-byte identical to `apps/cz-psp`. After A2's route-tree
restructure and the `getLang()`/`parliamentConfig` singleton removal, most page-level files here no
longer exist in this form (moved under `[lang]/[city]/...` and rewritten to use `params`). Files
that are still generic/unchanged by A2:

- `eslint.config.mjs`
- `next-env.d.ts`
- `postcss.config.mjs`
- `tsconfig.json`
- `src/app/api/revalidate/route.ts` — generic revalidate-by-secret endpoint, untouched by A2
- `src/components/MatomoScript.tsx`
- `src/components/MetricCard.tsx`
- `src/components/PageBlockRenderer.tsx` — diverges slightly now (see 5.5), still fundamentally the
  generic block-type switch

`src/lib/lang.ts`, `src/app/(site)/layout.tsx`, `src/app/(site)/about/page.tsx`,
`src/components/LangSwitcher.tsx`, `src/components/NavLinks.tsx`, `src/components/SortableMpTable.tsx`
were "identical, copied as-is" at A1 time — **all have since diverged or been deleted by A2**, see
sections 5.1/5.3/5.5 above.

## 2. Diverges — config/content swapped for generic placeholders [A1 — see section 5 for A2 changes]

The A1-era list of "same structure, only config/content differs" files is now mostly obsolete: A2
either moved these files into the `[lang]/[city]` tree (structural change, not just content) or
replaced their placeholder content with real Praha data (see 5.4). Two A1 divergences that are
**still accurate** after A2:

- `package.json` — name `@legislature/cz-cities`, dev port 3013 (unchanged)
- `next.config.ts` — still drops the `/digest/*` rewrite (cz-psp-only microservice); A2 additionally
  dropped the old-Czech-URL redirects (see 5.1)

Everything else in A1's original list 2 (parliament.config → city.config, groups.ts, types.ts,
data.ts, layout.tsx → [lang]/layout.tsx, opengraph-image.tsx, globals.css, page.tsx →
[lang]/[city]/page.tsx, members/member/groups/group pages, region/regions pages, chart components,
SiteHeader/SiteFooter, about.ts, generate-ai-readability.mjs, generated public/ files, auth.md,
favicon.svg, .well-known/README.md) has been superseded by A2 — see section 5 for what's there now.

## 3. Added (A1) [see section 5 for A2's additions]

A1 added `src/lib/parties.ts` (placeholder IDs, now real — 5.4), `src/components/CityLogotype.tsx`
(unchanged by A2), the placeholder analysis fixtures (deleted, replaced by
`src/fixtures/praha/...` — 5.4), placeholder vote-event fixtures (deleted, replaced by real Praha
vote events — 5.4), and the renamed agent-skill directories (unchanged by A2).

A2 additionally added: `src/lib/i18n.ts`, `src/lib/routing.ts`, `src/lib/city.config.ts` (renamed
from `parliament.config.ts`), `src/lib/site.ts`, `src/lib/csv.ts`, `src/lib/dictionaries/*`,
`src/components/SiteHeaderGlobal.tsx`, `src/components/SiteFooterGlobal.tsx`, and the entire
`src/app/[lang]/...` route tree.

## 4. Removed [A1, unchanged by A2]

A1's removals (the "Sněmovna Digest" microservice discovery files, real PSP vote-event fixtures,
`SnemovnaLogotype.tsx`) are unaffected by A2 — see git history for A1's original entry if needed.
A2's own removals are covered in section 5 (`region`/`regions` routes and types, `lib/lang.ts`,
`lib/parliament.config.ts`, `AttendanceSwarmChart.tsx`, placeholder fixtures, old-URL redirects).

---

## Placeholder data decision (build-time fetching) [A1 reasoning, still current after A2]

`apps/cz-psp`'s `src/lib/data.ts` fetches real, committed analysis output JSON from
`raw.githubusercontent.com/michalskop/cz-psp-data-2025-202x` at build/request time. A2 still doesn't
fetch over the network for cz-cities — see section 5.4 for why (same reasoning as A1: no stable
published data repo yet, `next build` would depend on/break on its availability). The only change is
*what* the local fixtures contain (real Praha data now, not fictional placeholders) and *how* they're
read (`src/lib/data.ts` now also parses raw CSV tables to derive rosters — see 5.4.1).
