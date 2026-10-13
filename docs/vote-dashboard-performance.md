# Vote dashboards: CPU incident and release requirements

On 13 October 2026, `mesta.datatimes.sk` was disabled by Vercel after the
`michalskops-projects` Hobby team exceeded its Active CPU allowance. This is
a reusable implementation warning for municipal and parliamentary dashboards.
A paid hosting plan restores capacity but leaves the expensive request path intact.

## Confirmed failure

The Slovak municipal vote-detail page requested all city vote events, loaded a
5–6 MB votes CSV, parsed 75,000–85,000 voter records, attached historical club
memberships to every event, sorted the full history, and only then selected
one vote. This work happened for every request, including nonexistent vote IDs.

The page read `searchParams` on the server to choose a visual layout. Next.js
therefore classified it as dynamic and rendered it on every request. Four layout
URLs and two languages multiplied the URLs that could trigger this work.

Although fetches specified `next: { revalidate: 3600 }`, production build logs
reported `items over 2MB can not be cached` for both the vote CSV and the event
JSON. A revalidation setting expresses caching intent; it does not prove the
payload is actually cached. Serialized/base64 cache entries can be larger than
the source file, as happened even to Bratislava's roughly 1.96 MB event JSON.

Executing the actual loader against in-memory source text locally used roughly
0.4–0.7 CPU seconds per call before network, cache serialization, and rendering
costs. The project's usage screenshot showed 7h 21m over the last 30 days,
mostly concentrated on October 13. The team API reported
`FAIR_USE_LIMITS_EXCEEDED`, overage type `fluidCpuDuration`.

The implementation defect is confirmed. The request volume, visitors, user agents,
and exact production CPU contribution of each route are unconfirmed: historical
runtime logs had expired. Do not describe a crawler, attack, or particular visitor
as the cause without traffic evidence. CPU seconds are distinct from elapsed
request duration, time waiting for downloads, and build execution time.

## Required data and rendering design

- Generate vote details in the data pipeline. A detail request must retrieve
  only the requested event and its voters; its work must scale with that event,
  not with the parliament's full voting history.
- Generate separate summary indexes, split into bounded shards when necessary.
  Index pages must not fetch all ballots or read every event file to derive titles
  and counts. Paginate the visible index when its HTML itself becomes large.
- Keep every fetched/cached artifact under an enforced byte budget. The Slovak
  pipeline uses 1,000,000 UTF-8 bytes to leave serialization overhead below the
  deployed Next.js 15 cache's 2 MB limit. Recheck this limit when changing Next.js
  versions or cache handlers. Wrapping a whole history in `unstable_cache` does
  not solve oversized entries. React `cache` deduplicates within a render and
  does not by itself provide a persistent cross-request cache.
- Perform display-only layout/filter switching in a client component. Use URL
  history so deep links and Back/Forward still work without another server render.
  Avoid reading presentation-only `searchParams` in a server vote page.
- Use static generation or on-demand ISR with explicit revalidation. Check parent
  route settings: an ancestor's `dynamicParams = false` can disable the intended
  on-demand fallback even when the child allows it.
- Verify middleware rewrites against the deployed runtime. In local Next.js
  15.5.12 tests, the English on-demand path cached correctly, while the unprefixed
  default-language path rewritten to `/sk/...` repeatedly rendered with private,
  no-store headers. A build's static route label alone did not catch this.
  The Slovak app uses an explicit default-language vote route to preserve ISR.
- Disable automatic prefetching on long lists of votes unless its cost is measured
  and bounded. Opening or scrolling an index must not silently generate thousands
  of detail pages.
- Preserve reviewed ballots, vote status, historical club boundaries, source URLs,
  extraction hashes, and dates. Count abstention, present non-voting, and absence
  consistently with the displayed voter records; never turn unavailable data into
  an apparently empty parliament or vote list.
- Include data-source and published-parliament environment variables in Turbo's
  build environment and cache key. Otherwise deployments may reuse output for
  the wrong source or publication configuration.

## Release evidence

Before adding a parliament, enabling votes, or copying an existing app:

1. Test a detail loader and record its fetches. Assert that one event causes one
   small event fetch and never a full `votes.csv`/whole-history load. Invalid and
   cross-parliament IDs must be rejected before network or filesystem access.
   A missing event returns 404; an upstream outage remains a visible error.
2. Verify all generated artifacts against the standard tables: ballot IDs/options,
   counts, historical clubs, event status, and provenance. Assert the byte budget
   and regenerate deterministically after source updates/withdrawals.
3. Build with the published data and production environment. Require no cache-size
   warnings and inspect the vote route's static/ISR classification and fallback
   manifest. Successful compilation alone is insufficient.
4. Start the production build and request representative votes twice. Verify the
   second response is a cache hit, with shared-cache/ISR headers rather than
   `private`/`no-store`. Repeat for the public default-language path, prefixed
   languages, canonical and short IDs, layout query variants, and missing IDs.
   Also check the actual Vercel deployment's `x-vercel-cache`/`x-nextjs-cache`.
5. In a browser, open a non-default layout deep link, switch every layout, and use
   Back/Forward. Confirm the chosen layout and URL agree and those interactions
   cause zero page/RSC/data requests. Check hydration/console errors.
6. After deployment, inspect CPU per route, function invocations, cache hits,
   request paths and user agents. Keep traffic evidence long enough to investigate
   a spike; Hobby's one-hour runtime-log retention was insufficient here. Configure
   usage alerts and decide explicitly whether spend controls may pause production.

The Slovak app's regressions are available as `pnpm --filter @legislature/sk-cities
test:votes`; its data tests live in `sk-municipalities-votes-2022-2026/tests`.
Use `node scripts/check-vote-cache.cjs DEFAULT_VOTE_URL ENGLISH_VOTE_URL` from
the app directory against a production build and the deployment. This warms
each path and query variant, then requires a real cache hit and rejects private
or no-store responses. Chromium may refresh the static favicon after history
changes; exclude that browser behavior when checking for page/RSC/data requests.

## Other apps reviewed on 14 October 2026

| App | Current source risk | Follow-up |
| --- | --- | --- |
| `sk-cities` | Full-history reconstruction and dynamic layouts were confirmed | Small per-vote exports, client layouts, bounded indexes, explicit default route and ISR are the remediation in this change |
| `cz-cities` | Same `getCityVoteEvents(...).find(...)` detail loader and server `searchParams`; the whole-history branch is conditional on `hasVoteEvents` | Migrate applicable cities to small per-vote exports and client layouts; audit active datasets and cache warnings before enabling more cities |
| `cz-psp` | Already reads one local vote JSON, but server layout query handling renders detail pages dynamically | Move presentation-only layout switching to the client and verify route caching; the Slovak CSV-rebuild defect is not present in this loader |
| `sk-nrsr` | Already reads one local vote JSON, but server layout query handling renders detail pages dynamically | Same rendering follow-up as `cz-psp` |

This table is a source audit, not a claim that all these production deployments
experienced the incident or are fixed by the Slovak changes. Do not copy the old
`cz-cities` vote loader into a new dashboard.

References:
- [Next.js 15 navigation and prefetching](https://nextjs.org/docs/15/app/getting-started/linking-and-navigating)
- [Next.js static parameters and ISR](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Vercel runtime-log retention](https://vercel.com/docs/logs/runtime)
- [Vercel Hobby included usage](https://vercel.com/docs/plans/hobby)
