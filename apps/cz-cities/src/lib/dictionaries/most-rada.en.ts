import type { CityTranslations } from "../city.config";

// English dictionary for "most-rada" (Rada města Mostu, the executive council) — added
// 2026-08-29. Mirrors every other city's dictionary shape and tone exactly; only city-specific
// facts differ. Same terminology rule applies (see praha.en.ts's comment): never "councillor" in
// English UI copy — use "assembly member" (here: "council member", since this body is the
// executive council, not the elected assembly).
export const mostRadaEn: CityTranslations = {
  nav: { overview: "Overview", members: "Council members" },
  member: {
    singular: "council member",
    plural: "council members",
    current: "Current council members",
    former: "Former council members",
  },
  metrics: {
    attendance: "Attendance",
    rebelity: "Rebelliousness",
    govity: "Coalition alignment",
    corrections: "Vote corrections",
    wpca: "Voting positions (WPCA)",
  },
  ui: {
    memberCount: "{n} council members",
    voteCount: "of {total} votes",
    rebelVotes: "{n} rebellious votes",
    announcedCorrections: "{n} announced",
    outOf: "of",
    currentMembers: "Current council members",
    backToOverview: "← Back to overview",
  },
  home: {
    title: "Most City Council (Executive)",
    description:
      "Attendance, rebelliousness, and coalition alignment for members of Most's executive city council (Rada města Mostu), derived from the council's roll-call votes (2022–2026 term). The council is the governing coalition's own executive body — every member is, by definition, part of the coalition.",
    membersCardTitle: "Council members",
    membersCardDescription: "Attendance, group loyalty and other metrics for each council member.",
    groupsCardTitle: "Groups",
    groupsCardDescription: "Overview of groups represented on the council with aggregated metrics.",
  },
  about: { navLabel: "About" },
  seo: {
    siteTitle: "Most City Council (Executive) - mesta.datatimes.cz",
    titleSuffix: " — Most City Council (Executive) — mesta.datatimes.cz",
    defaultDescription:
      "Roll-call vote analysis for Most's executive city council — attendance, rebelliousness, coalition alignment, and voting-position map.",
  },
  footer: {
    dataSource: "Data: zastupko.cz (executive council roll-call vote feed), 2022–2026 term",
    aboutSection: "About",
    projectsSection: "Our projects",
    contactSection: "Contact",
  },
  table: {
    allFilter: "All",
    sortAsc: "Sort ascending",
    sortDesc: "Sort descending",
    name: "Council member",
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
      otherAxisLabel: "Differences within the coalition",
    },
  },
};
