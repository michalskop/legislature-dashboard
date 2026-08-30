import type { CityTranslations } from "../city.config";

// English dictionary for Hradec Králové — added 2026-08-30. Mirrors every other city's dictionary
// shape and tone exactly; only city-specific facts differ. Same terminology rule applies (see
// praha.en.ts's comment): never "councillor" in English UI copy — use "assembly member".
export const hradecKraloveEn: CityTranslations = {
  nav: { overview: "Overview", members: "Assembly members" },
  member: {
    singular: "assembly member",
    plural: "assembly members",
    current: "Current assembly members",
    former: "Former assembly members",
  },
  metrics: {
    attendance: "Attendance",
    rebelity: "Rebelliousness",
    govity: "Coalition alignment",
    corrections: "Vote corrections",
    wpca: "Voting positions (WPCA)",
  },
  ui: {
    memberCount: "{n} assembly members",
    voteCount: "of {total} votes",
    rebelVotes: "{n} rebellious votes",
    announcedCorrections: "{n} announced",
    outOf: "of",
    currentMembers: "Current assembly members",
    backToOverview: "← Back to overview",
  },
  home: {
    title: "Hradec Králové City Assembly",
    description:
      "Attendance, rebelliousness, and coalition alignment for Hradec Králové City Assembly members, derived from the assembly's roll-call votes (2022–2026 term).",
    membersCardTitle: "Assembly members",
    membersCardDescription: "Attendance, group loyalty and other metrics for each assembly member.",
    groupsCardTitle: "Groups",
    groupsCardDescription: "Overview of council groups with aggregated metrics.",
  },
  about: { navLabel: "About" },
  seo: {
    siteTitle: "Hradec Králové City Assembly - mesta.datatimes.cz",
    titleSuffix: " — Hradec Králové — mesta.datatimes.cz",
    defaultDescription:
      "Roll-call vote analysis for the Hradec Králové City Assembly — attendance, rebelliousness, coalition alignment, and voting-position map.",
  },
  footer: {
    dataSource: "Data: zastupko.fit.vutbr.cz (assembly roll-call votes), 2022–2026 term",
    aboutSection: "About",
    projectsSection: "Our projects",
    contactSection: "Contact",
  },
  table: {
    allFilter: "All",
    sortAsc: "Sort ascending",
    sortDesc: "Sort descending",
    name: "Assembly member",
    party: "Group",
    attendance: "Attendance",
    rebelity: "Rebelliousness",
    govity: "Coalition alignment",
    corrections: "Vote corrections",
  },
  charts: {
    average: "Average",
    wpca: {
      govAxisLabelPositive: "◄ ◄ ◄ Opposition | Coalition ► ► ►",
      govAxisLabelNegative: "◄ ◄ ◄ Coalition | Opposition ► ► ►",
      otherAxisLabel: "Differences within coalition or opposition",
    },
  },
};
