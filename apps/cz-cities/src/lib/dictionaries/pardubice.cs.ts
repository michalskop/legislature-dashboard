import type { CityTranslations } from "../city.config";

// Czech dictionary for Pardubice — added 2026-08-31. Mirrors every other city's dictionary shape
// and tone exactly; only city-specific facts (name, data source, wpca labels) differ.
export const pardubiceCs: CityTranslations = {
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
    title: "Zastupitelstvo města Pardubic",
    description:
      "Přehled docházky, rebelování a shody s koalicí u zastupitelů a zastupitelek města Pardubic na základě jmenovitých hlasování zastupitelstva (volební období 2022–2026).",
    membersCardTitle: "Zastupitelé",
    membersCardDescription: "Účast na hlasování, shoda s klubem a další metriky pro každého zastupitele.",
    groupsCardTitle: "Kluby",
    groupsCardDescription: "Přehled zastupitelských klubů s agregovanými metrikami.",
  },
  about: { navLabel: "O projektu" },
  seo: {
    siteTitle: "Zastupitelstvo města Pardubic - Města.DataTimes.cz",
    titleSuffix: " - Pardubice - Města.DataTimes.cz",
    defaultDescription:
      "Přehled jmenovitých hlasování Zastupitelstva města Pardubic — účast, rebelování, shoda s koalicí, pozice na základě hlasování.",
  },
  footer: {
    // Real source: per-meeting ZIP archives on pardubice.eu (each with a dedicated clean-text-layer
    // voting PDF, occasionally a UTF-16 .txt). See pardubice/config/sources.yml in the city data
    // repo for the full trail — this city is NOT on the shared zastupko backend.
    dataSource: "Data: pardubice.eu (protokoly o hlasování zastupitelstva), volební období 2022–2026",
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
      // matching whichever raw sign pardubice/analyses/wpca/outputs/government_axis.json's
      // government_sign reports at render time — not hardcoded to a fixed dimension. Pardubice has
      // a real, strong government/opposition axis (dim0 r=0.93, government_sign=1), like Ústí nad
      // Labem and Hradec Králové.
      govAxisLabelPositive: "◄ ◄ ◄ Opozice | Koalice ► ► ►",
      govAxisLabelNegative: "◄ ◄ ◄ Koalice | Opozice ► ► ►",
      otherAxisLabel: "Rozdíly v rámci koalice nebo opozice",
    },
  },
};
