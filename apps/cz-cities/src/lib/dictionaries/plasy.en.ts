import type { CityTranslations } from "../city.config";

export const plasyEn: CityTranslations = {
  nav: { overview: "Overview", members: "Assembly members" },
  member: {
    singular: "assembly member",
    plural: "Assembly members",
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
    title: "Plasy City Assembly",
    description:
      "Named votes of the Plasy City Assembly for the 2022–2026 term and attendance by its members.",
    membersCardTitle: "Assembly members",
    membersCardDescription: "Assembly members and their attendance at votes.",
    groupsCardTitle: "Groups",
    groupsCardDescription: "The published minutes do not include assembly-group information.",
  },
  about: { navLabel: "About" },
  seo: {
    siteTitle: "Plasy City Assembly — Města.DataTimes.cz",
    titleSuffix: " — Plasy — Města.DataTimes.cz",
    defaultDescription:
      "Named votes of the Plasy City Assembly and member attendance for the 2022–2026 term.",
  },
  footer: {
    dataSource: "Data: official Plasy council minutes and resolutions, 2022–2026 term",
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
      govAxisLabelPositive: "Coalition",
      govAxisLabelNegative: "Coalition",
      otherAxisLabel: "Voting",
    },
  },
};
