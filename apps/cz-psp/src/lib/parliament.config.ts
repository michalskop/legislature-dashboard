import type { ParliamentConfig } from "@legislature/parliament-core";

export const parliamentConfig: ParliamentConfig = {
  id: "cz-psp",
  name: "Poslanecká sněmovna",
  defaultLang: "cs",
  dataBase: "https://raw.githubusercontent.com/michalskop/cz-psp-data-2025-202x/main/analyses",
  analyses: ["attendance", "rebelity", "govity", "wpca", "vote-corrections"],

  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        cs: { singular: "klub",  plural: "kluby",  listTitle: "Poslanecké kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Parliamentary groups" },
      },
    },
    {
      classification: "candidate_list",
      urlSegment: "party",
      listUrlSegment: "parties",
      hasPage: false,
      labels: {
        cs: { singular: "strana",  plural: "strany",  listTitle: "Strany" },
        en: { singular: "party",   plural: "parties", listTitle: "Parties" },
      },
    },
    {
      classification: "constituency",
      urlSegment: "region",
      listUrlSegment: "regions",
      hasPage: true,
      labels: {
        cs: { singular: "kraj",   plural: "kraje",   listTitle: "Kraje" },
        en: { singular: "region", plural: "regions", listTitle: "Regions" },
      },
    },
  ],

  translations: {
    cs: {
      nav: { overview: "Přehled", members: "Poslanci" },
      member: {
        singular: "poslanec/kyně",
        plural: "poslanci",
        current: "Současní poslanci",
        former: "Bývalí poslanci",
      },
      metrics: {
        attendance: "Účast na hlasování",
        rebelity: "Rebelita",
        govity: "Vládnost",
        corrections: "Opravy hlasování",
        wpca: "Ideologické pozice (WPCA)",
      },
      ui: {
        memberCount: "{n} poslanců",
        voteCount: "z {total} hlasování",
        rebelVotes: "{n} rebel. hlasování",
        announcedCorrections: "{n} oznámených",
        outOf: "z",
        currentMembers: "Současní poslanci",
        backToOverview: "← Zpět na přehled",
      },
      home: {
        title: "Poslanecká sněmovna",
        description: "Přehled aktivity poslanců a stran v české Poslanecké sněmovně 2025–2029.",
        membersCardTitle: "Poslanci",
        membersCardDescription: "Účast na hlasování, věrnost straně a další metriky pro každého poslance.",
        groupsCardTitle: "Strany",
        groupsCardDescription: "Přehled stran a jejich poslaneckých klubů s agregovanými metrikami.",
      },
      about: { navLabel: "O projektu" },
      seo: {
        siteTitle: "Sněmovna.DataTimes.cz",
        titleSuffix: " - Sněmovna.DataTimes.cz",
        defaultDescription: "Přehled aktivity poslanců a stran v české Poslanecké sněmovně 2025–2029.",
      },
      footer: {
        dataSource: "Data: Poslanecká sněmovna ČR",
        aboutSection: "O projektu",
        projectsSection: "Naše projekty",
        contactSection: "Kontakt",
      },
      table: {
        allFilter: "Všichni",
        sortAsc: "Seřadit vzestupně",
        sortDesc: "Seřadit sestupně",
        name: "Poslanec/kyně",
        party: "Strana",
        attendance: "Účast",
        rebelity: "Rebelita",
        govity: "Vládnost",
        corrections: "Opravy hlasování",
      },
      charts: {
        average: "Průměr",
        wpca: {
          xLabel: "◄ ◄ ◄ Vládní koalice\u2009|\u2009Opozice ► ► ►",
          yLabel: "Rozdíly v rámci koalice nebo opozice",
        },
      },
    },
    en: {
      nav: { overview: "Overview", members: "MPs" },
      member: {
        singular: "MP",
        plural: "MPs",
        current: "Current MPs",
        former: "Former MPs",
      },
      metrics: {
        attendance: "Attendance",
        rebelity: "Rebelliousness",
        govity: "Gov. alignment",
        corrections: "Vote corrections",
        wpca: "Ideological positions (WPCA)",
      },
      ui: {
        memberCount: "{n} MPs",
        voteCount: "of {total} votes",
        rebelVotes: "{n} rebellious votes",
        announcedCorrections: "{n} announced",
        outOf: "of",
        currentMembers: "Current MPs",
        backToOverview: "← Back to overview",
      },
      home: {
        title: "Chamber of Deputies of the Czech Republic",
        description: "Overview of activity of MPs and parties in the Czech Chamber of Deputies 2025–2029.",
        membersCardTitle: "MPs",
        membersCardDescription: "Attendance, party loyalty and other metrics for each MP.",
        groupsCardTitle: "Groups",
        groupsCardDescription: "Overview of parliamentary groups with aggregated metrics.",
      },
      about: { navLabel: "About" },
      seo: {
        siteTitle: "snemovna.datatimes.cz",
        titleSuffix: " — snemovna.datatimes.cz",
        defaultDescription: "Overview of activity of MPs and parties in the Czech Chamber of Deputies 2025–2029.",
      },
      footer: {
        dataSource: "Data: Chamber of Deputies of the Czech Republic",
        aboutSection: "About",
        projectsSection: "Our projects",
        contactSection: "Contact",
      },
      table: {
        allFilter: "All",
        sortAsc: "Sort ascending",
        sortDesc: "Sort descending",
        name: "MP",
        party: "Party",
        attendance: "Attendance",
        rebelity: "Rebelliousness",
        govity: "Gov. alignment",
        corrections: "Vote corrections",
      },
      charts: {
        average: "Average",
        wpca: {
          xLabel: "◄ ◄ ◄ Government coalition\u2009|\u2009Opposition ► ► ►",
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
          referenceLines: [{ value: 0.5, label: "50\u00a0%" }],
        },
        labels: {
          cs: { title: "Účast na hlasování", description: "Každý bod = jeden poslanec/poslankyně. Kliknutím přejdete na jeho/její profil." },
          en: { title: "Attendance", description: "Each dot = one MP. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Ideologické pozice", description: "2D mapa poslanců podle způsobu hlasování (WPCA). Kliknutím přejdete na profil." },
          en: { title: "Ideological positions", description: "2D map of MPs by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelita", description: "Jak často poslanec/poslankyně hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often the MP votes against their own club." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto" },
        labels: {
          cs: { title: "Vládnost", description: "Jak často poslanec/poslankyně hlasuje shodně s vládní koalicí." },
          en: { title: "Gov. alignment", description: "How often the MP votes in line with the government coalition." },
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
          referenceLines: [{ value: 0.5, label: "50\u00a0%" }],
        },
        labels: {
          cs: { title: "Účast na hlasování", description: "Pozice v rámci sněmovny." },
          en: { title: "Attendance", description: "Position within the parliament." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          cs: { title: "Ideologické pozice (WPCA)", description: "Poloha na základě analýzy hlasování." },
          en: { title: "Ideological positions (WPCA)", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          cs: { title: "Rebelita", description: "Jak často hlasuje proti svému klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their club." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto" },
        labels: {
          cs: { title: "Vládnost", description: "Jak často hlasuje shodně s vládní koalicí." },
          en: { title: "Gov. alignment", description: "How often they vote in line with the government coalition." },
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
          cs: { title: "Ideologické pozice (WPCA)", description: "Členové klubu v kontextu celé sněmovny." },
          en: { title: "Ideological positions (WPCA)", description: "Group members in the context of the full parliament." },
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

    regionDetail: [
      {
        id: "metrics-grid",
        config: { type: "metrics-grid" },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: true },
        labels: {
          cs: { title: "Poslanci z kraje" },
          en: { title: "MPs from this region" },
        },
      },
    ],
  },
};
