import type { CityTranslations } from "../city.config";

// Czech dictionary for Hradec Králové — added 2026-08-30. Mirrors every other city's dictionary
// shape and tone exactly; only city-specific facts (name, data source, wpca labels) differ.
export const hradecKraloveCs: CityTranslations = {
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
    title: "Zastupitelstvo města Hradec Králové",
    description:
      "Přehled docházky, rebelování a shody s koalicí u zastupitelů a zastupitelek města Hradec Králové na základě jmenovitých hlasování zastupitelstva (volební období 2022–2026).",
    membersCardTitle: "Zastupitelé",
    membersCardDescription: "Účast na hlasování, shoda s klubem a další metriky pro každého zastupitele.",
    groupsCardTitle: "Kluby",
    groupsCardDescription: "Přehled zastupitelských klubů s agregovanými metrikami.",
  },
  about: { navLabel: "O projektu" },
  seo: {
    siteTitle: "Zastupitelstvo města Hradec Králové - Města.DataTimes.cz",
    titleSuffix: " - Hradec Králové - Města.DataTimes.cz",
    defaultDescription:
      "Přehled jmenovitých hlasování Zastupitelstva města Hradec Králové — účast, rebelování, shoda s koalicí, pozice na základě hlasování.",
  },
  footer: {
    // Real source: the shared zastupko.fit.vutbr.cz platform (FIT VUT), dataset id 9 — the same
    // backend as Brno/Most/most-rada. See hradec-kralove/config/sources.yml in the city data repo
    // for the full source trail (JSON feed, per-person votes via zastupiteleHlasy[]; one open
    // caveat about feed staleness documented there).
    dataSource: "Data: zastupko.fit.vutbr.cz (jmenovitá hlasování zastupitelstva), volební období 2022–2026",
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
      // Same word-order convention as every other city's dictionary (see praha.cs.ts's comment
      // for the full owner-confirmed rule): the government word sits nearest the "►►►" end
      // matching whichever raw sign
      // hradec-kralove/analyses/wpca/outputs/government_axis.json's government_sign reports at
      // render time — not hardcoded to a fixed dimension. Hradec Králové has a real, strong
      // government/opposition axis (r=0.98 on dim0 at build time, government_sign=1), so this
      // label is expected to carry real signal here, same as Ústí nad Labem.
      govAxisLabelPositive: "◄ ◄ ◄ Opozice | Koalice ► ► ►",
      govAxisLabelNegative: "◄ ◄ ◄ Koalice | Opozice ► ► ►",
      otherAxisLabel: "Rozdíly v rámci koalice nebo opozice",
    },
  },
};
