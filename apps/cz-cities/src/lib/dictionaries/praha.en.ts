import type { ParliamentTranslations } from "@legislature/parliament-core";

// English dictionary for Praha — task A2. Minimal but real content: correct
// and complete enough to render every page sensibly (not empty/broken).
// Polish/full copy review is task A3 ("City branding + translations").
//
// Terminology rule (owner review fix, 2026-08-05, project-wide, not
// Praha-only — see DIVERGENCE.md "Terminology: never 'councillor'"): never
// use "councillor"/"councillors" in English UI copy. In Czech city
// government the "rada" (executive council) is a different body from the
// "zastupitelstvo" (elected assembly); "councillor" reads as a member of the
// former to an English speaker, which is wrong for members of the latter.
// Use "assembly member"/"assembly members" instead — pairs with this city's
// own English org name, "Prague City Assembly" (home.title below). Every
// future city's English dictionary must follow the same rule.
export const prahaEn: ParliamentTranslations = {
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
    title: "Prague City Assembly",
    description:
      "Attendance, rebelliousness, and coalition alignment for Prague City Assembly members, derived from the assembly's roll-call votes (2022–2026 term).",
    membersCardTitle: "Assembly members",
    membersCardDescription: "Attendance, group loyalty and other metrics for each assembly member.",
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
      xLabel: "◄ ◄ ◄ Coalition | Opposition ► ► ►",
      yLabel: "Differences within coalition or opposition",
    },
  },
};
