import type { ParliamentConfig } from "@legislature/parliament-core";

// ─────────────────────────────────────────────────────────────────────────
// PLACEHOLDER CONFIG — task A1 scaffold only.
//
// This is a generic, single-city-shaped stand-in config for "a Czech city
// assembly" (zastupitelstvo). It is NOT Praha/Brno/Ostrava-specific and does
// NOT implement multi-city routing — that is task A2 (see plan.md D5, A2),
// which needs a real CityConfig[] array, /[lang]/[city] routing, and real
// Praha data (not available yet, blocked on C7/C8).
//
// `dataBase` below documents the *future* real URL shape (per plan.md
// section 2 / D8), but src/lib/data.ts does NOT fetch it yet — see the
// comment there and DIVERGENCE.md for why (no city analysis outputs are
// published yet; the data pipeline is a parallel, in-progress task).
// ─────────────────────────────────────────────────────────────────────────
export const parliamentConfig: ParliamentConfig = {
  id: "cz-cities",
  name: "Zastupitelstvo (placeholder)",
  defaultLang: "cs",
  dataBase:
    "https://raw.githubusercontent.com/michalskop/cz-municipalities-votes-2022-2026/main/PLACEHOLDER-CITY/analyses",
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "PLACEHOLDER", // D10 — owner creates a real Matomo site ID before go-live
  },

  // Cities have no constituency/region organization (same as sk-nrsr —
  // ParliamentConfig already supports this). Only "group" (council faction)
  // is modeled for this generic scaffold.
  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub", plural: "kluby", listTitle: "Zastupitelské kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Council groups" },
      },
    },
  ],

  translations: {
    cs: {
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
        title: "Zastupitelstvo (placeholder)",
        description:
          "Ukázková, zástupná verze přehledu hlasování zastupitelstva — bez skutečných dat. Slouží jen jako scaffold pro budoucí konkrétní města (Praha, Brno, Ostrava).",
        membersCardTitle: "Zastupitelé",
        membersCardDescription: "Účast na hlasování, shoda s klubem a další metriky pro každého zastupitele.",
        groupsCardTitle: "Kluby",
        groupsCardDescription: "Přehled zastupitelských klubů s agregovanými metrikami.",
      },
      about: { navLabel: "O projektu" },
      seo: {
        siteTitle: "Mesta.DataTimes.cz (placeholder)",
        titleSuffix: " - Mesta.DataTimes.cz",
        defaultDescription:
          "Ukázkový, zástupný přehled hlasování zastupitelstva — scaffold bez skutečných dat.",
      },
      footer: {
        dataSource: "Data: zástupná (placeholder) — skutečná data budou doplněna po dokončení datové pipeline",
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
          xLabel: "◄ ◄ ◄ Koalice | Opozice ► ► ►",
          yLabel: "Rozdíly v rámci koalice nebo opozice",
        },
      },
    },
    en: {
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
        title: "City Assembly (placeholder)",
        description:
          "A sample, placeholder city-council roll-call-vote dashboard — no real data. Serves only as a scaffold for future real cities (Praha, Brno, Ostrava).",
        membersCardTitle: "Councillors",
        membersCardDescription: "Attendance, group loyalty and other metrics for each councillor.",
        groupsCardTitle: "Groups",
        groupsCardDescription: "Overview of council groups with aggregated metrics.",
      },
      about: { navLabel: "About" },
      seo: {
        siteTitle: "mesta.datatimes.cz (placeholder)",
        titleSuffix: " — mesta.datatimes.cz",
        defaultDescription: "A sample, placeholder city-council dashboard — scaffold with no real data.",
      },
      footer: {
        dataSource: "Data: placeholder — real data will follow once the data pipeline is complete",
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
    },
  },

  pages: {
    home: [
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Jeden bod = jeden zastupitel/ka. Kliknutím přejdete na jejich profil." },
          en: { title: "Attendance", description: "Each dot = one councillor. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "2D mapa zastupitelů podle způsobu hlasování (WPCA). Kliknutím přejdete na jejich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of councillors by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často zastupitel/ka hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the councillor votes against their own group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto" },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často zastupitel/ka hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often the councillor votes in line with the coalition." },
        },
      },
    ],

    memberDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "attendance-swarm",
        config: {
          type: "swarm-chart",
          analysis: "attendance",
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          cs: { title: "Účast na hlasováních", description: "Pozice v rámci zastupitelstva." },
          en: { title: "Attendance", description: "Position within the assembly." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelování", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their group." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto" },
        labels: {
          cs: { title: "Shoda s koalicí", description: "Jak často hlasuje shodně s koalicí." },
          en: { title: "Coalition alignment", description: "How often they vote in line with the coalition." },
        },
      },
    ],

    groupDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Pozice na základě hlasování", description: "Členové klubu v kontextu celého zastupitelstva." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full assembly." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          cs: { title: "Členové klubu" },
          en: { title: "Group members" },
        },
      },
    ],

    // No regionDetail — cities have no constituency organization (see D5 note above).
  },
};
