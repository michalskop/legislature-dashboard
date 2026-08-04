import type { ParliamentTranslations } from "@legislature/parliament-core";

// English dictionary for Praha — task A2. Minimal but real content: correct
// and complete enough to render every page sensibly (not empty/broken).
// Polish/full copy review is task A3 ("City branding + translations").
export const prahaEn: ParliamentTranslations = {
  nav: { overview: "Overview", members: "Councillors" },
  member: {
    singular: "councillor",
    plural: "councillors",
    current: "Current councillors",
    former: "Former councillors",
  },
  metrics: {
    attendance: "Attendance",
    rebelity: "Rebelliousness",
    govity: "Coalition alignment",
    corrections: "Vote corrections",
    wpca: "Voting positions (WPCA)",
  },
  ui: {
    memberCount: "{n} councillors",
    voteCount: "of {total} votes",
    rebelVotes: "{n} rebellious votes",
    announcedCorrections: "{n} announced",
    outOf: "of",
    currentMembers: "Current councillors",
    backToOverview: "← Back to overview",
  },
  home: {
    title: "Prague City Assembly",
    description:
      "Attendance, rebelliousness, and coalition alignment for Prague city councillors, derived from the City Assembly's roll-call votes (2022–2026 term).",
    membersCardTitle: "Councillors",
    membersCardDescription: "Attendance, group loyalty and other metrics for each councillor.",
    groupsCardTitle: "Groups",
    groupsCardDescription: "Overview of council groups with aggregated metrics.",
  },
  about: { navLabel: "About" },
  seo: {
    siteTitle: "Prague City Assembly - mesta.datatimes.cz",
    titleSuffix: " — Prague — mesta.datatimes.cz",
    defaultDescription:
      "Roll-call vote analysis for the Prague City Assembly — attendance, rebelliousness, coalition alignment, and voting-position map.",
  },
  footer: {
    dataSource: "Data: City of Prague open data (Golemio, CC BY 4.0), 2022–2026 term",
    aboutSection: "About",
    projectsSection: "Our projects",
    contactSection: "Contact",
  },
  table: {
    allFilter: "All",
    sortAsc: "Sort ascending",
    sortDesc: "Sort descending",
    name: "Councillor",
    party: "Group",
    attendance: "Attendance",
    rebelity: "Rebelliousness",
    govity: "Coalition alignment",
    corrections: "Vote corrections",
  },
  charts: {
    average: "Average",
    wpca: {
      xLabel: "◄ ◄ ◄ Coalition | Opposition ► ► ►",
      yLabel: "Differences within coalition or opposition",
    },
  },
};
