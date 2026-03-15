# Adding a new parliament or language

## Adding a new language to an existing parliament

**Time estimate: ~30 minutes**

### 1. Add translations to `parliament.config.ts`

Open `apps/<parliament>/src/lib/parliament.config.ts` and add a new key to the `translations` object.
Every field in `ParliamentTranslations` is required — copy the existing language block and translate all strings.

```ts
translations: {
  cs: { /* existing */ },
  en: { /* existing */ },
  sk: {                          // ← new language
    nav: { overview: "Prehľad", members: "Poslanci" },
    member: { singular: "poslanec/kyňa", plural: "poslanci", current: "Súčasní poslanci", former: "Bývalí poslanci" },
    metrics: { attendance: "Účasť", rebelity: "Rebelita", govity: "Vládnosť", corrections: "Opravy hlasovania", wpca: "Ideologické pozície (WPCA)" },
    ui: { memberCount: "{n} poslancov", voteCount: "z {total} hlasovaní", rebelVotes: "{n} rebel. hlasovaní", announcedCorrections: "{n} oznámených", outOf: "z", currentMembers: "Súčasní poslanci", backToOverview: "← Späť na prehľad" },
    home: { title: "...", description: "...", membersCardTitle: "Poslanci", membersCardDescription: "...", groupsCardTitle: "Skupiny", groupsCardDescription: "..." },
    about: { navLabel: "O projekte" },
    footer: { dataSource: "...", aboutSection: "O projekte", projectsSection: "Naše projekty", contactSection: "Kontakt" },
    charts: { average: "Priemer", wpca: { xLabel: "...", yLabel: "..." } },
    table: { allFilter: "Všetci", sortAsc: "Zoradiť vzostupne", sortDesc: "Zoradiť zostupne", name: "Poslanec/kyňa", party: "Strana", attendance: "Účasť", rebelity: "Rebelita", govity: "Vládnosť", corrections: "Opravy hlasovania" },
  },
},
```

Also translate the org type labels:

```ts
organizations: [
  {
    classification: "group",
    labels: {
      cs: { singular: "klub", plural: "kluby", listTitle: "Poslanecké kluby" },
      en: { singular: "group", plural: "groups", listTitle: "Parliamentary groups" },
      sk: { singular: "klub", plural: "kluby", listTitle: "Poslanecké kluby" },  // ← add
    },
  },
  // ... same for constituency
],
```

And each `PageBlock` that has labels:

```ts
{ id: "attendance-swarm", config: { ... }, labels: {
  cs: { title: "Účast na hlasování", description: "..." },
  en: { title: "Attendance", description: "..." },
  sk: { title: "Účasť na hlasovaní", description: "..." },  // ← add
}},
```

### 2. Add about-page content

Open `apps/<parliament>/src/content/about.ts` and add the new language key:

```ts
export const aboutContent: Record<string, AboutContent> = {
  cs: { /* existing */ },
  en: { /* existing */ },
  sk: {
    pageTitle: "O projekte",
    intro: "...",
    backLabel: "← Späť na prehľad",
    sections: [ /* ... */ ],
  },
};
```

### 3. Done

`getLang()` reads supported languages automatically from `Object.keys(parliamentConfig.translations)`.
The language switcher in the header appears automatically when ≥ 2 languages are configured.
No other code changes are needed.

---

## Adding a new parliament

**Time estimate: ~1–2 days for a parliament with the same data format**

### 1. Create a new Next.js app

```bash
cp -r apps/cz-psp apps/sk-nrsr
cd apps/sk-nrsr
```

Update `package.json`:
```json
{ "name": "@legislature/sk-nrsr" }
```

Update `next.config.ts` — remove the Czech-specific redirects and add any parliament-specific ones.

### 2. Write `parliament.config.ts`

This is the main configuration file. Fill in all fields of `ParliamentConfig`:

```ts
export const parliamentConfig: ParliamentConfig = {
  id: "sk-nrsr",
  name: "Národná rada SR",
  defaultLang: "sk",
  dataBase: "https://raw.githubusercontent.com/.../analyses",
  analyses: ["attendance", "rebelity", "govity", "wpca"],  // omit analyses not available

  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: { sk: { singular: "klub", plural: "kluby", listTitle: "Poslanecké kluby" } },
    },
    // Add "constituency" org if the parliament has regional constituencies
    // Add "candidate_list" org if needed
  ],

  translations: { sk: { /* all fields */ } },

  pages: {
    home: [ /* PageBlock[] */ ],
    memberDetail: [ /* PageBlock[] */ ],
    groupDetail: [ /* PageBlock[] */ ],
    regionDetail: [ /* PageBlock[] — omit if no regional org */ ],
  },
};
```

**Key decisions when configuring `pages`:**

| Block type | When to include |
|---|---|
| `swarm-chart` with `analysis: "attendance"` | Always |
| `swarm-chart` with `analysis: "rebelity"` | If rebelity analysis is available |
| `swarm-chart` with `analysis: "govity"` | If there is a clear government/opposition divide |
| `scatter-chart` (WPCA) | If WPCA analysis is available |
| `member-table` with `columns: ["attendance", "rebelity"]` | Use `columns` to hide metrics not available for this parliament |

### 3. Add party/group metadata

Party badge colors and abbreviations live in `packages/ui/src/components/PartyBadge.tsx`.
Add entries for the new parliament's parties to `CZ_PSP_PARTY_META` — or create a separate `SK_NRSR_PARTY_META` and export it alongside.

```ts
export const SK_NRSR_PARTY_META: Record<string, PartyMeta> = {
  smer: { shortName: "Smer", faceAbbr: "SD", darkText: false },
  // ...
};
```

Then use the new meta in the parliament's chart components (or pass it via config — this is a planned improvement).

### 4. Set up data fetching

Copy `apps/cz-psp/src/lib/data.ts` and update the fetch functions to point to the new parliament's data files.
The data format must follow `legislature-data-standard`. Key files:

```
{dataBase}/current_members.json
{dataBase}/current_groups.json
{dataBase}/attendance/attendance.json
{dataBase}/rebelity/rebelity.json
{dataBase}/govity/govity.json
{dataBase}/wpca/wpca.json
{dataBase}/vote-corrections/vote-corrections.json   ← optional
```

Omit fetch calls for analyses not present in `config.analyses`.

### 5. Update `about.ts`

Write the about-page content for the new parliament in `apps/<id>/src/content/about.ts`.

### 6. Configure Vercel / deployment

Add the new app to `turbo.json` and create a new Vercel project pointing to `apps/<id>`.

### 7. Checklist

- [ ] `parliament.config.ts` — all fields filled, `analyses` matches available data
- [ ] `data.ts` — fetch functions updated, `revalidate` set
- [ ] Party metadata added to `packages/ui`
- [ ] `about.ts` written
- [ ] `public/favicon.svg` updated
- [ ] `globals.css` — party color CSS variables added
- [ ] Typecheck passes: `pnpm typecheck`
- [ ] Dev server runs: `pnpm dev`
