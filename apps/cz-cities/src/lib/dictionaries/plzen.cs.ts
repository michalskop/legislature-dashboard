import type { CityTranslations } from "../city.config";

// Czech dictionary for Plzeň — added 2026-08-28 when Plzeň's data pipeline reached the same
// maturity as every other city (real dated klub data, owner-approved government_groups, nightly
// automation). Mirrors praha.cs.ts/brno.cs.ts/ostrava.cs.ts/most.cs.ts's shape and tone exactly;
// only city-specific facts (name, data source, wpca labels) differ.
export const plzenCs: CityTranslations = {
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
    title: "Zastupitelstvo města Plzně",
    description:
      "Přehled docházky, rebelování a shody s koalicí u zastupitelů a zastupitelek města Plzně na základě jmenovitých hlasování zastupitelstva (volební období 2022–2026).",
    membersCardTitle: "Zastupitelé",
    membersCardDescription: "Účast na hlasování, shoda s klubem a další metriky pro každého zastupitele.",
    groupsCardTitle: "Kluby",
    groupsCardDescription: "Přehled zastupitelských klubů s agregovanými metrikami.",
  },
  about: { navLabel: "O projektu" },
  seo: {
    siteTitle: "Zastupitelstvo města Plzně - Města.DataTimes.cz",
    titleSuffix: " - Plzeň - Města.DataTimes.cz",
    defaultDescription:
      "Přehled jmenovitých hlasování Zastupitelstva města Plzně — účast, rebelování, shoda s koalicí, pozice na základě hlasování.",
  },
  footer: {
    // Real source: usneseni.plzen.eu's ZMP vote-protocol pages — see plzen/config/sources.yml in
    // the city data repo for the full source trail (three different protocol formats across the
    // term, incl. a current PDF-based one).
    dataSource: "Data: usneseni.plzen.eu (výsledky hlasování zastupitelstva), volební období 2022–2026",
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
      // matching whichever raw sign plzen/analyses/wpca/outputs/government_axis.json's
      // government_sign reports at render time — not hardcoded to a fixed dimension.
      govAxisLabelPositive: "◄ ◄ ◄ Opozice | Koalice ► ► ►",
      govAxisLabelNegative: "◄ ◄ ◄ Koalice | Opozice ► ► ►",
      otherAxisLabel: "Rozdíly v rámci koalice nebo opozice",
    },
  },
};
