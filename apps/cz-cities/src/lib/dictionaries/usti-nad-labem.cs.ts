import type { CityTranslations } from "../city.config";

// Czech dictionary for Ústí nad Labem — added 2026-08-29. Mirrors every other city's dictionary
// shape and tone exactly; only city-specific facts (name, data source, wpca labels) differ.
export const ustiNadLabemCs: CityTranslations = {
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
    title: "Zastupitelstvo města Ústí nad Labem",
    description:
      "Přehled docházky, rebelování a shody s koalicí u zastupitelů a zastupitelek města Ústí nad Labem na základě jmenovitých hlasování zastupitelstva (volební období 2022–2026).",
    membersCardTitle: "Zastupitelé",
    membersCardDescription: "Účast na hlasování, shoda s klubem a další metriky pro každého zastupitele.",
    groupsCardTitle: "Kluby",
    groupsCardDescription: "Přehled zastupitelských klubů s agregovanými metrikami.",
  },
  about: { navLabel: "O projektu" },
  seo: {
    siteTitle: "Zastupitelstvo města Ústí nad Labem - Města.DataTimes.cz",
    titleSuffix: " - Ústí nad Labem - Města.DataTimes.cz",
    defaultDescription:
      "Přehled jmenovitých hlasování Zastupitelstva města Ústí nad Labem — účast, rebelování, shoda s koalicí, pozice na základě hlasování.",
  },
  footer: {
    // Real source: usti.cz's ZM meeting-protocol PDFs — see usti-nad-labem/config/sources.yml in
    // the city data repo for the full source trail (one PDF per meeting, bundling all of that
    // meeting's roll-call votes; the cleanest source found across all 7 cities so far — no login,
    // no format drift, no font-encoding corruption).
    dataSource: "Data: usti.cz (výsledky hlasování zastupitelstva), volební období 2022–2026",
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
      // matching whichever raw sign usti-nad-labem/analyses/wpca/outputs/government_axis.json's
      // government_sign reports at render time — not hardcoded to a fixed dimension. Unlike
      // most-rada, Ústí has a real, strong government/opposition axis (r=0.97 on dim0 at build
      // time), so this label is expected to carry real signal here.
      govAxisLabelPositive: "◄ ◄ ◄ Opozice | Koalice ► ► ►",
      govAxisLabelNegative: "◄ ◄ ◄ Koalice | Opozice ► ► ►",
      otherAxisLabel: "Rozdíly v rámci koalice nebo opozice",
    },
  },
};
