import type { CityTranslations } from "../city.config";

export const plasyCs: CityTranslations = {
  nav: { overview: "Přehled", members: "Zastupitelé" },
  member: {
    singular: "zastupitel/ka",
    plural: "Zastupitelé a zastupitelky",
    current: "Současní zastupitelé a zastupitelky",
    former: "Bývalí zastupitelé a zastupitelky",
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
    currentMembers: "Současní zastupitelé a zastupitelky",
    backToOverview: "← Zpět na přehled",
  },
  home: {
    title: "Zastupitelstvo města Plasy",
    description:
      "Jmenovitá hlasování zastupitelstva města Plasy ve volebním období 2022–2026 a účast jeho členů a členek.",
    membersCardTitle: "Zastupitelé a zastupitelky",
    membersCardDescription: "Seznam členů zastupitelstva a jejich účast na hlasováních.",
    groupsCardTitle: "Kluby",
    groupsCardDescription: "Údaje o zastupitelských klubech nejsou v zápisech k dispozici.",
  },
  about: { navLabel: "O projektu" },
  seo: {
    siteTitle: "Zastupitelstvo města Plasy — Města.DataTimes.cz",
    titleSuffix: " — Plasy — Města.DataTimes.cz",
    defaultDescription:
      "Jmenovitá hlasování Zastupitelstva města Plasy a účast členů a členek ve volebním období 2022–2026.",
  },
  footer: {
    dataSource: "Data: oficiální zápisy a usnesení města Plasy, volební období 2022–2026",
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
      govAxisLabelPositive: "Koalice",
      govAxisLabelNegative: "Koalice",
      otherAxisLabel: "Hlasování",
    },
  },
};
