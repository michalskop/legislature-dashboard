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
    member: {
      singular: "poslanec/kyňa", plural: "poslanci",
      current: "Súčasní poslanci", former: "Bývalí poslanci",
    },
    metrics: {
      attendance: "Účasť", rebelity: "Rebelita", govity: "Vládnosť",
      corrections: "Opravy hlasovania", wpca: "Ideologické pozície (WPCA)",
    },
    ui: {
      memberCount: "{n} poslancov", voteCount: "z {total} hlasovaní",
      rebelVotes: "{n} rebel. hlasovaní", announcedCorrections: "{n} oznámených",
      outOf: "z", currentMembers: "Súčasní poslanci", backToOverview: "← Späť na prehľad",
    },
    home: {
      title: "Národná rada SR", description: "...",
      membersCardTitle: "Poslanci", membersCardDescription: "...",
      groupsCardTitle: "Kluby", groupsCardDescription: "...",
    },
    about: { navLabel: "O projekte" },
    seo: {
      siteTitle: "nrsr.datatimes.sk",
      titleSuffix: " - nrsr.datatimes.sk",
      defaultDescription: "...",
    },
    footer: {
      dataSource: "Dáta: Národná rada SR",
      aboutSection: "O projekte", projectsSection: "Naše projekty", contactSection: "Kontakt",
    },
    charts: {
      average: "Priemer",
      wpca: { xLabel: "◄ ◄ ◄ Koalícia | Opozícia ► ► ►", yLabel: "Rozdiely v rámci koalície alebo opozície" },
    },
    table: {
      allFilter: "Všetci", sortAsc: "Zoradiť vzostupne", sortDesc: "Zoradiť zostupne",
      name: "Poslanec/kyňa", party: "Strana", attendance: "Účasť",
      rebelity: "Rebelita", govity: "Vládnosť", corrections: "Opravy hlasovania",
    },
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
  // ... same for constituency org if present
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

`getLang()` derives supported languages automatically from `Object.keys(parliamentConfig.translations)`.
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

Update `next.config.ts` — remove any parliament-specific redirects (e.g. old Czech URLs) and add new ones if needed.

### 2. Set up the data source

Data is fetched at runtime from raw GitHub file URLs — no build step in the data repo is needed.
The app reads files like:

```
https://raw.githubusercontent.com/<org>/<data-repo>/main/analyses/attendance/attendance.json
```

Set `dataBase` in `parliament.config.ts` to the base URL of the analyses folder:

```ts
dataBase: "https://raw.githubusercontent.com/michalskop/sk-nrsr-data/main/analyses",
```

Next.js ISR (`revalidate: 3600` by default) means the app re-fetches data at most every hour.
The data repo runs a nightly GitHub Actions workflow that updates the JSON files.
No manual deploy or webhook is needed — the app picks up new data automatically within 1 hour.

Key data files expected under `{dataBase}/`:

```
current_members.json
current_groups.json
attendance/attendance.json
rebelity/rebelity.json
govity/govity.json
wpca/wpca.json
vote-corrections/vote-corrections.json   ← optional
```

Copy `apps/cz-psp/src/lib/data.ts` and update the fetch paths. Omit fetch calls for analyses not in `config.analyses`.

### 3. Write `parliament.config.ts`

This is the single source of truth. Fill in all fields of `ParliamentConfig`:

```ts
export const parliamentConfig: ParliamentConfig = {
  id: "sk-nrsr",
  name: "Národná rada SR",
  defaultLang: "sk",
  dataBase: "https://raw.githubusercontent.com/.../analyses",
  analyses: ["attendance", "rebelity", "govity", "wpca"],  // omit unavailable analyses

  matomo: {          // optional — omit if not using Matomo
    url: "//matomo.kohovolit.eu/",
    siteId: "7",
  },

  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: { sk: { singular: "klub", plural: "kluby", listTitle: "Poslanecké kluby" } },
    },
    // Add "constituency" if the parliament has regional constituencies
  ],

  translations: { sk: { /* all fields — see section above */ } },

  pages: {
    home: [ /* PageBlock[] */ ],
    memberDetail: [ /* PageBlock[] */ ],
    groupDetail: [ /* PageBlock[] */ ],
    regionDetail: [ /* PageBlock[] — omit key if no constituency org */ ],
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

### 4. Add party/group metadata

Party badge colors and abbreviations live in `packages/ui/src/components/PartyBadge.tsx`.
Create a new metadata export alongside the existing `CZ_PSP_PARTY_META`:

```ts
export const SK_NRSR_PARTY_META: Record<string, PartyMeta> = {
  smer:  { shortName: "Smer-SD", faceAbbr: "SD",  darkText: false },
  ps:    { shortName: "PS",      faceAbbr: "PS",   darkText: false },
  // ...
};

export const SK_NRSR_PARTY_COLORS: Record<string, string> = {
  smer: "#c8102e",
  ps:   "#0057a8",
  // ...
};
```

Note: chart dot colors are automatically darkened if too light (perceived brightness > 0.65) via
`ensureChartContrast()` from `@legislature/utils` — no manual adjustment needed for light colors like yellows.

### 5. Update `about.ts`

Write the about-page content for the new parliament in `apps/<id>/src/content/about.ts`.

### 6. Update branding assets

Update the site logotype and favicon:

- **Logotype component**: Create a new logotype component (e.g., `NrsrLogotype.tsx` for Slovak parliament) based on the existing logotype component. Update the text to match your parliament (e.g., "NRSR.DataTimes.sk" instead of "Sněmovna.DataTimes.cz")
- **Update imports**: Replace all imports of the old logotype component in `SiteHeader.tsx`, `SiteFooter.tsx`, and `opengraph-image.tsx`
- **Favicon**: Edit `apps/<id>/public/favicon.svg` to reflect the parliament's branding (e.g., change "S" to "NR" for NRSR, or use appropriate abbreviation)
- **Colors**: Adjust the gradient colors in the favicon SVG to match the parliament's visual identity
- Consider updating the text size if using multi-character abbreviations

### 8. Update `layout.tsx`

Set the correct `metadataBase` URL and `locale` for the new parliament:

```ts
metadataBase: new URL("https://nrsr.datatimes.sk"),
openGraph: { locale: "sk_SK", ... },
```

### 9. Configure Vercel / deployment

Add the new app to `turbo.json` and create a new Vercel project pointing to `apps/<id>`.

### 10. Checklist

- [ ] `parliament.config.ts` — all fields filled, `analyses` matches available data, constituency org omitted if not applicable
- [ ] `data.ts` — fetch functions updated, `dataBase` URL correct, `revalidate` set
- [ ] Party metadata and colors added to `packages/ui`
- [ ] `about.ts` written
- [ ] Logotype component created and imported in header, footer, and OpenGraph image
- [ ] `public/favicon.svg` updated with parliament branding (abbreviation, colors)
- [ ] `globals.css` — party color CSS variables added if needed
- [ ] `layout.tsx` — `metadataBase` and `locale` updated
- [ ] `app/(site)/page.tsx` — JSON-LD structured data updated with correct site URL, parliament name, and temporal coverage
- [ ] `scripts/generate-ai-readability.mjs` — base URL and data repository references updated
- [ ] `matomo.siteId` set (or key omitted if not using Matomo)
- [ ] Navigation links filtered correctly (regions hidden if no constituency org)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm dev` runs without errors
