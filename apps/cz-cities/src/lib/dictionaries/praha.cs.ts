import type { CityTranslations } from "../city.config";

// Czech dictionary for Praha — task A2. Real content (not "placeholder"
// scaffold copy). One dictionary file per (city, language) — see
// city.config.ts's `translations` map and lib/i18n.ts's module doc: adding a
// language to an existing city is "add one file like this one + register it
// in city.config.ts's translations map + list the code in lib/i18n.ts's
// LANGS" — no route/component/middleware code changes.
export const prahaCs: CityTranslations = {
  nav: { overview: "Přehled", members: "Zastupitelé" },
  member: {
    singular: "zastupitel/ka",
    plural: "zastupitelé",
    current: "Současní zastupitelé",
    former: "Bývalí zastupitelé",
  },
  metrics: {
    attendance: "Účast na hlasováních",
    rebelity: "Rebelování",
    govity: "Shoda s koalicí",
    corrections: "Opravy hlasování",
    wpca: "Pozice na základě hlasování",
  },
  ui: {
    memberCount: "{n} zastupitelů",
    voteCount: "z {total} hlasování",
    rebelVotes: "{n} rebel. hlasování",
    announcedCorrections: "{n} oznámených",
    outOf: "z",
    currentMembers: "Současní zastupitelé",
    backToOverview: "← Zpět na přehled",
  },
  home: {
    title: "Zastupitelstvo hlavního města Prahy",
    description:
      "Přehled docházky, rebelování a shody s koalicí u zastupitelů a zastupitelek hlavního města Prahy na základě jmenovitých hlasování zastupitelstva (volební období 2022–2026).",
    membersCardTitle: "Zastupitelé",
    membersCardDescription: "Účast na hlasování, shoda s klubem a další metriky pro každého zastupitele.",
    groupsCardTitle: "Kluby",
    groupsCardDescription: "Přehled zastupitelských klubů s agregovanými metrikami.",
  },
  about: { navLabel: "O projektu" },
  seo: {
    siteTitle: "Zastupitelstvo hl. m. Prahy - Města.DataTimes.cz",
    titleSuffix: " - Praha - Města.DataTimes.cz",
    defaultDescription:
      "Přehled jmenovitých hlasování Zastupitelstva hlavního města Prahy — účast, rebelování, shoda s koalicí, pozice na základě hlasování.",
  },
  footer: {
    dataSource: "Data: otevřená data hl. m. Prahy (Golemio, CC BY 4.0), volební období 2022–2026",
    aboutSection: "O projektu",
    projectsSection: "Naše projekty",
    contactSection: "Kontakt",
  },
  table: {
    allFilter: "Všichni",
    sortAsc: "Seřadit vzestupně",
    sortDesc: "Seřadit sestupně",
    name: "Zastupitel/ka",
    party: "Klub",
    attendance: "Účast",
    rebelity: "Rebelování",
    govity: "Shoda s koalicí",
    corrections: "Opravy hlasování",
  },
  charts: {
    average: "Průměr",
    wpca: {
      // Owner fix (2026-08-05, DIVERGENCE.md §8 round 4, corrected after
      // screenshot verification): the word order must match which end
      // government is actually on (government_axis.json's government_sign).
      // Verified empirically against real rendered output (cross-referenced
      // against the chart's own gridlines, not assumed from the rotation
      // transform): for this rotate(-90) SVG label, the FIRST word in the
      // string (nearest the "◄◄◄" arrows) ends up on the POSITIVE/higher
      // end, and the LAST word (nearest "►►►") ends up on the
      // NEGATIVE/lower end — so when government_sign is positive, the
      // government word must come FIRST. Praha's current term has
      // government_sign=+1, so "Koalice | Opozice" is the one currently in
      // use — see lib/data.ts's getGovernmentAxisPlacement.
      govAxisLabelPositive: "◄ ◄ ◄ Koalice | Opozice ► ► ►",
      govAxisLabelNegative: "◄ ◄ ◄ Opozice | Koalice ► ► ►",
      // Owner fix (2026-08-05, DIVERGENCE.md §8 round 4): reverted to the
      // original text at the owner's request — kept regardless of which raw
      // dimension this ends up being, even though its precise relationship
      // to coalition/opposition isn't the *detected* one shown on the other
      // axis.
      otherAxisLabel: "Rozdíly v rámci koalice nebo opozice",
    },
  },
};
