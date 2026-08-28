import type { CityTranslations } from "../city.config";

// Czech dictionary for "most-rada" (Rada města Mostu, the executive council) — added 2026-08-29.
// A separate pseudo-city slug per the owner's 2026-08-28 decision (recommended option: reuse the
// entire existing single-body architecture rather than teach the dashboard a new
// multi-organization-per-city concept — see this repo's memory: most-source-research). Mirrors
// every other city's dictionary shape and tone exactly; only city-specific facts differ.
export const mostRadaCs: CityTranslations = {
  nav: { overview: "Přehled", members: "Členové rady" },
  member: {
    singular: "člen/ka rady",
    plural: "členové rady",
    current: "Současní členové rady",
    former: "Bývalí členové rady",
  },
  metrics: {
    attendance: "Účast na hlasováních",
    rebelity: "Rebelování",
    govity: "Shoda s koalicí",
    corrections: "Opravy hlasování",
    wpca: "Pozice na základě hlasování",
  },
  ui: {
    memberCount: "{n} členů rady",
    voteCount: "z {total} hlasování",
    rebelVotes: "{n} rebel. hlasování",
    announcedCorrections: "{n} oznámených",
    outOf: "z",
    currentMembers: "Současní členové rady",
    backToOverview: "← Zpět na přehled",
  },
  home: {
    title: "Rada města Mostu",
    description:
      "Přehled docházky, rebelování a shody s koalicí u členů a členek Rady města Mostu na základě jmenovitých hlasování rady (volební období 2022–2026). Rada je výkonný orgán tvořený vládnoucí koalicí — všichni její členové jsou proto formálně součástí koalice.",
    membersCardTitle: "Členové rady",
    membersCardDescription: "Účast na hlasování, shoda s klubem a další metriky pro každého člena rady.",
    groupsCardTitle: "Kluby",
    groupsCardDescription: "Přehled klubů zastoupených v radě s agregovanými metrikami.",
  },
  about: { navLabel: "O projektu" },
  seo: {
    siteTitle: "Rada města Mostu - Města.DataTimes.cz",
    titleSuffix: " - Rada města Mostu - Města.DataTimes.cz",
    defaultDescription:
      "Přehled jmenovitých hlasování Rady města Mostu — účast, rebelování, shoda s koalicí, pozice na základě hlasování.",
  },
  footer: {
    // Real source: zastupko.fit.vutbr.cz's shared FIT VUT feed (same backend most/'s
    // zastupitelstvo pipeline uses), dataset id 8, organ="rada" — see most-rada/config/sources.yml
    // in the city data repo for the full source trail. Rada meetings are usually closed/private
    // for Czech municipalities — Most publishing named roll-call votes for its rada is a rarity.
    dataSource: "Data: zastupko.cz (výsledky hlasování rady), volební období 2022–2026",
    aboutSection: "O projektu",
    projectsSection: "Naše projekty",
    contactSection: "Kontakt",
  },
  table: {
    allFilter: "Všichni",
    sortAsc: "Seřadit vzestupně",
    sortDesc: "Seřadit sestupně",
    name: "Člen/ka rady",
    party: "Klub",
    attendance: "Účast",
    rebelity: "Rebelování",
    govity: "Shoda s koalicí",
    corrections: "Opravy hlasování",
  },
  charts: {
    average: "Průměr",
    wpca: {
      // Same word-order convention as every other city's dictionary. NOTE: for this body the
      // government/opposition axis carries little real signal (every member is government by
      // construction, see home.description) — the label logic is kept identical to every other
      // city for consistency, but the chart itself is expected to look less structured here.
      govAxisLabelPositive: "◄ ◄ ◄ Opozice | Koalice ► ► ►",
      govAxisLabelNegative: "◄ ◄ ◄ Koalice | Opozice ► ► ►",
      otherAxisLabel: "Rozdíly v rámci koalice",
    },
  },
};
