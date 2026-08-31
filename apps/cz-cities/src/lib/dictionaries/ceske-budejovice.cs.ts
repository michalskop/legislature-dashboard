import type { CityTranslations } from "../city.config";

// Czech dictionary for České Budějovice — added 2026-08-31. Mirrors every other city's dictionary
// shape and tone exactly; only city-specific facts (name, data source, wpca labels) differ.
export const ceskeBudejoviceCs: CityTranslations = {
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
    title: "Zastupitelstvo statutárního města České Budějovice",
    description:
      "Přehled docházky, rebelování a shody s koalicí u zastupitelů a zastupitelek města České Budějovice na základě jmenovitých hlasování zastupitelstva (volební období 2022–2026).",
    membersCardTitle: "Zastupitelé",
    membersCardDescription: "Účast na hlasování, shoda s klubem a další metriky pro každého zastupitele.",
    groupsCardTitle: "Kluby",
    groupsCardDescription: "Přehled zastupitelských klubů s agregovanými metrikami.",
  },
  about: { navLabel: "O projektu" },
  seo: {
    siteTitle: "Zastupitelstvo města České Budějovice - Města.DataTimes.cz",
    titleSuffix: " - České Budějovice - Města.DataTimes.cz",
    defaultDescription:
      "Přehled jmenovitých hlasování Zastupitelstva statutárního města České Budějovice — účast, rebelování, shoda s koalicí, pozice na základě hlasování.",
  },
  footer: {
    // Real source: the city's own VOATT "Jak se hlasovalo" statistics portal on
    // www.c-budejovice.cz (plain-GET HTML tables, per-councillor named votes). See
    // ceske-budejovice/config/sources.yml in the city data repo for the full trail.
    dataSource: "Data: c-budejovice.cz („Jak se hlasovalo“, jmenovitá hlasování zastupitelstva), volební období 2022–2026",
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
      // matching whichever raw sign ceske-budejovice/analyses/wpca/outputs/government_axis.json's
      // government_sign reports at render time. České Budějovice has a real government/opposition
      // axis (dim0 r=0.88, government_sign=1) — a bit weaker than HK/Pardubice, consistent with
      // its minority coalition that lost partners mid-term.
      govAxisLabelPositive: "◄ ◄ ◄ Opozice | Koalice ► ► ►",
      govAxisLabelNegative: "◄ ◄ ◄ Koalice | Opozice ► ► ►",
      otherAxisLabel: "Rozdíly v rámci koalice nebo opozice",
    },
  },
};
