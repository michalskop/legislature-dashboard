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
