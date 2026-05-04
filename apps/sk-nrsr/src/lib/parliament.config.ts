import type { ParliamentConfig } from "@legislature/parliament-core";

export const parliamentConfig: ParliamentConfig = {
  id: "sk-nrsr",
  name: "Národná rada SR",
  defaultLang: "sk",
  dataBase: "https://raw.githubusercontent.com/michalskop/sk-nrsr-data-2023-202x/main/analyses",
  analyses: ["attendance", "rebelity", "govity", "wpca"],

  matomo: {
    url: "//matomo.kohovolit.eu/",
    siteId: "7",
  },

  organizations: [
    {
      classification: "group",
      urlSegment: "group",
      listUrlSegment: "groups",
      hasPage: true,
      labels: {
        sk: { singular: "klub",  plural: "kluby",  listTitle: "Poslanecké kluby" },
        en: { singular: "group", plural: "groups", listTitle: "Parliamentary groups" },
      },
    },
  ],

  translations: {
    sk: {
      nav: { overview: "Prehľad", members: "Poslanci" },
      member: {
        singular: "poslanec/kyňa",
        plural: "poslanci",
        current: "Súčasní poslanci",
        former: "Bývalí poslanci",
      },
      metrics: {
        attendance: "Účasť na hlasovaniach",
        rebelity: "Rebelita",
        govity: "Vládnosť",
        corrections: "Opravy hlasovania",
        wpca: "Ideologické pozície (WPCA)",
      },
      ui: {
        memberCount: "{n} poslancov",
        voteCount: "z {total} hlasovaní",
        rebelVotes: "{n} rebel. hlasovaní",
        announcedCorrections: "{n} oznámených",
        outOf: "z",
        currentMembers: "Súčasní poslanci",
        backToOverview: "← Späť na prehľad",
      },
      home: {
        title: "Národná rada SR",
        description: "Prehľad aktivity poslancov a strán v Národnej rade SR 2023–.",
        membersCardTitle: "Poslanci",
        membersCardDescription: "Účasť na hlasovaní, vernosť klubu a ďalšie metriky pre každého poslanca.",
        groupsCardTitle: "Kluby",
        groupsCardDescription: "Prehľad poslaneckých klubov s agregovanými metrikami.",
      },
      about: { navLabel: "O projekte" },
      seo: {
        siteTitle: "nrsr.datatimes.cz",
        titleSuffix: " - nrsr.datatimes.cz",
        defaultDescription: "Prehľad aktivity poslancov a strán v Národnej rade SR 2023–.",
      },
      footer: {
        dataSource: "Dáta: Národná rada SR",
        aboutSection: "O projekte",
        projectsSection: "Naše projekty",
        contactSection: "Kontakt",
      },
      table: {
        allFilter: "Všetci",
        sortAsc: "Zoradiť vzostupne",
        sortDesc: "Zoradiť zostupne",
        name: "Poslanec/kyňa",
        party: "Strana",
        attendance: "Účasť",
        rebelity: "Rebelita",
        govity: "Vládnosť",
        corrections: "Opravy hlasovania",
      },
      charts: {
        average: "Priemer",
        wpca: {
          xLabel: "◄ ◄ ◄ Koalícia | Opozícia ► ► ►",
          yLabel: "Rozdiely v rámci koalície alebo opozície",
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
        title: "National Council of the Slovak Republic",
        description: "Overview of activity of MPs and parties in the Slovak National Council 2023–.",
        membersCardTitle: "MPs",
        membersCardDescription: "Attendance, party loyalty and other metrics for each MP.",
        groupsCardTitle: "Groups",
        groupsCardDescription: "Overview of parliamentary groups with aggregated metrics.",
      },
      about: { navLabel: "About" },
      seo: {
        siteTitle: "nrsr.datatimes.cz",
        titleSuffix: " — nrsr.datatimes.cz",
        defaultDescription: "Overview of activity of MPs and parties in the Slovak National Council 2023–.",
      },
      footer: {
        dataSource: "Data: National Council of the Slovak Republic",
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
          xLabel: "◄ ◄ ◄ Government coalition | Opposition ► ► ►",
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
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          sk: { title: "Účasť na hlasovaniach", description: "Jeden bod = jeden poslanec/poslankyňa. Kliknutím prejdete na ich profil." },
          en: { title: "Attendance", description: "Each dot = one MP. Click to open their profile." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          sk: { title: "Ideologické pozície", description: "2D mapa poslancov podľa spôsobu hlasovania (WPCA). Kliknutím prejdete na ich profil." },
          en: { title: "Positions based on voting behaviour", description: "2D map of MPs by voting patterns (WPCA). Click to open their profile." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          sk: { title: "Rebelita", description: "Ako často poslanec/poslankyňa hlasuje proti svojmu klubu." },
          en: { title: "Rebelliousness", description: "How often the MP votes against their own club." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto" },
        labels: {
          sk: { title: "Vládnosť", description: "Ako často poslanec/poslankyňa hlasuje zhodne s vládnou koalíciou." },
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
          referenceLines: [{ value: 0.5, label: "50 %" }],
        },
        labels: {
          sk: { title: "Účasť na hlasovaniach", description: "Pozícia v rámci parlamentu." },
          en: { title: "Attendance", description: "Position within the parliament." },
        },
      },
      {
        id: "wpca-scatter",
        config: { type: "scatter-chart", analysis: "wpca" },
        labels: {
          sk: { title: "Ideologické pozície", description: "Poloha na základe analýzy hlasovania." },
          en: { title: "Positions based on voting behaviour", description: "Position based on voting analysis." },
        },
      },
      {
        id: "rebelity-swarm",
        config: { type: "swarm-chart", analysis: "rebelity", yMode: "auto", yDecimals: 1 },
        labels: {
          sk: { title: "Rebelita", description: "Ako často hlasuje proti svojmu klubu." },
          en: { title: "Rebelliousness", description: "How often they vote against their club." },
        },
      },
      {
        id: "govity-swarm",
        config: { type: "swarm-chart", analysis: "govity", yMode: "auto" },
        labels: {
          sk: { title: "Vládnosť", description: "Ako často hlasuje zhodne s vládnou koalíciou." },
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
          sk: { title: "Ideologické pozície", description: "Členovia klubu v kontexte celého parlamentu." },
          en: { title: "Positions based on voting behaviour", description: "Group members in the context of the full parliament." },
        },
      },
      {
        id: "member-table",
        config: { type: "member-table", showPartyFilter: false },
        labels: {
          sk: { title: "Členovia klubu" },
          en: { title: "Group members" },
        },
      },
    ],
  },
};
