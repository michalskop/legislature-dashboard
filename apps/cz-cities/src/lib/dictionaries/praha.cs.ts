import type { ParliamentTranslations } from "@legislature/parliament-core";

// Czech dictionary for Praha — task A2. Real content (not "placeholder"
// scaffold copy). One dictionary file per (city, language) — see
// city.config.ts's `translations` map and lib/i18n.ts's module doc: adding a
// language to an existing city is "add one file like this one + register it
// in city.config.ts's translations map + list the code in lib/i18n.ts's
// LANGS" — no route/component/middleware code changes.
export const prahaCs: ParliamentTranslations = {
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
      xLabel: "◄ ◄ ◄ Koalice | Opozice ► ► ►",
      yLabel: "Rozdíly v rámci koalice nebo opozice",
    },
  },
};
