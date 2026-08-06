import type { CityTranslations } from "../city.config";

// Czech dictionary for Praha — task A2. Real content (not "placeholder"
// scaffold copy). One dictionary file per (city, language) — see
// city.config.ts's `translations` map and lib/i18n.ts's module doc: adding a
// language to an existing city is "add one file like this one + register it
// in city.config.ts's translations map + list the code in lib/i18n.ts's
// LANGS" — no route/component/middleware code changes.
export const prahaCs: CityTranslations = {
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
    title: "Zastupitelstvo hlavního města Prahy",
    description:
      "Přehled docházky, rebelování a shody s koalicí u zastupitelů a zastupitelek hlavního města Prahy na základě jmenovitých hlasování zastupitelstva (volební období 2022–2026).",
    membersCardTitle: "Zastupitelé",
    membersCardDescription: "Účast na hlasování, shoda s klubem a další metriky pro každého zastupitele.",
    groupsCardTitle: "Kluby",
    groupsCardDescription: "Přehled zastupitelských klubů s agregovanými metrikami.",
  },
  about: { navLabel: "O projektu" },
  seo: {
    siteTitle: "Zastupitelstvo hl. m. Prahy - Města.DataTimes.cz",
    titleSuffix: " - Praha - Města.DataTimes.cz",
    defaultDescription:
      "Přehled jmenovitých hlasování Zastupitelstva hlavního města Prahy — účast, rebelování, shoda s koalicí, pozice na základě hlasování.",
  },
  footer: {
    dataSource: "Data: otevřená data hl. m. Prahy (Golemio, CC BY 4.0), volební období 2022–2026",
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
      // Owner fix (2026-08-05, DIVERGENCE.md §8 round 5): the word order
      // must match which end government is actually on (government_axis
      // .json's government_sign) — confirmed directly by the project owner,
      // twice, against the real rendered chart: for Praha's current term
      // (government_sign=+1, coalition on the positive/"up" end), the
      // correct string is "Opozice | Koalice" (government word LAST, nearest
      // "►►►"). NOTE: an in-repo attempt to verify this independently
      // (pixel cross-reference against gridlines + a named member's
      // highlighted dot) produced the opposite conclusion and was corrected
      // back after the owner's direct observation contradicted it twice —
      // trust the owner's read of the live rendering over a repo-side replay
      // of that verification if this is ever revisited, and re-derive the
      // rotation rule from scratch rather than reuse this comment's earlier
      // (wrong) reasoning. See lib/data.ts's getGovernmentAxisPlacement.
      govAxisLabelPositive: "◄ ◄ ◄ Opozice | Koalice ► ► ►",
      govAxisLabelNegative: "◄ ◄ ◄ Koalice | Opozice ► ► ►",
      // Owner fix (2026-08-05, DIVERGENCE.md §8 round 4): reverted to the
      // original text at the owner's request — kept regardless of which raw
      // dimension this ends up being, even though its precise relationship
      // to coalition/opposition isn't the *detected* one shown on the other
      // axis.
      otherAxisLabel: "Rozdíly v rámci koalice nebo opozice",
    },
  },
};
