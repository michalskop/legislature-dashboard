// ─── MP / Party profile types ────────────────────────────────────────────────

export interface MpProfile {
  personId: string;
  slug: string;
  name: string;
  isCurrent: boolean;
  mandateSince: string | null;
  mandateUntil: string | null;
  givenName: string;
  familyName: string;
  image: string | null;
  groupId: string | null;
  groupName: string | null;
  partyId: string | null;
  constituency: string | null;
  attendance: {
    present_share: number;
    present: number;
    absent: number;
    vote_events_total: number;
  } | null;
  rebelity: {
    rebelity: number;
    rebelity_total: number;
    rebelity_possible: number;
  } | null;
  govity: {
    govity: number;
    govity_total: number;
    govity_possible: number;
  } | null;
  voteCorrections: {
    corrections_total: number;
    corrections_announced: number;
    corrections_invalidated: number;
    vote_events_total: number;
  } | null;
  wpca: {
    x: number;
    y: number;
    weight: number;
    included: boolean;
  } | null;
}

export interface PartyProfile {
  groupId: string;
  slug: string;
  name: string;
  partyId: string;
  memberCount: number;
  avgAttendance: number | null;
  avgRebelity: number | null;
  avgGovity: number | null;
}

// Classification types matching legislature-data-standard
export type OrgClassification = "group" | "candidate_list" | "constituency" | "parliament";

// URL segment config for one org type
export interface OrgTypeConfig {
  classification: OrgClassification;
  urlSegment: string;        // e.g. "group", "party", "region"
  listUrlSegment: string;    // e.g. "groups", "parties", "regions"
  hasPage: boolean;
  labels: Record<string, { singular: string; plural: string; listTitle?: string }>;
}

// Translation strings for common UI
export interface ParliamentTranslations {
  nav: {
    overview: string;
    members: string;
  };
  member: {
    singular: string;
    plural: string;
    current: string;
    former: string;
  };
  metrics: {
    attendance: string;
    rebelity: string;
    govity: string;
    corrections: string;
    wpca: string;
  };
  ui: {
    memberCount: string;
    voteCount: string;
    rebelVotes: string;
    announcedCorrections: string;
    outOf: string;
    currentMembers: string;
    backToOverview: string;
  };
  home: {
    title: string;
    description: string;
    membersCardTitle: string;
    membersCardDescription: string;
    groupsCardTitle: string;
    groupsCardDescription: string;
  };
  about: {
    navLabel: string;       // "O projektu" / "About"
  };
  seo: {
    siteTitle: string;      // "snemovna.datatimes.cz"
    titleSuffix: string;    // " — snemovna.datatimes.cz"
    defaultDescription: string;
  };
  footer: {
    dataSource: string;     // "Data: Poslanecká sněmovna ČR"
    aboutSection: string;   // "O projektu"
    projectsSection: string; // "Naše projekty"
    contactSection: string;  // "Kontakt"
  };
  table: {
    allFilter: string;    // "Všichni" / "All"
    sortAsc: string;      // "Seřadit vzestupně" / "Sort ascending"
    sortDesc: string;     // "Seřadit sestupně" / "Sort descending"
    name: string;         // "Poslanec/kyně" / "MP"
    party: string;        // "Strana" / "Party"
    attendance: string;   // "Účast" / "Attendance"
    rebelity: string;     // "Rebelita" / "Rebelliousness"
    govity: string;       // "Vládnost" / "Gov. alignment"
    corrections: string;  // "Opravy hlasování" / "Vote corrections"
  };
  charts: {
    average: string;        // "Průměr" / "Average"
    wpca: {
      xLabel: string;       // "◄ ◄ ◄ Vládní koalice | Opozice ► ► ►"
      yLabel: string;       // "Rozdíly v rámci koalice nebo opozice"
    };
  };
}

// ─── Page block system ────────────────────────────────────────────────────────

export type BlockType =
  | "metrics-grid"    // MetricCard row for the member/group/region
  | "swarm-chart"     // SwarmPlot (attendance, rebelity, govity)
  | "scatter-chart"   // ScatterPlot (WPCA)
  | "member-table"    // SortableMpTable
  | "text";           // plain markdown/text block

export interface SwarmBlockConfig {
  type: "swarm-chart";
  analysis: "attendance" | "rebelity" | "govity";
  yMode?: "full" | "auto";
  yDecimals?: number;
  referenceLines?: Array<{ value: number; label: string }>;
}

export interface ScatterBlockConfig {
  type: "scatter-chart";
  analysis: "wpca";
}

export interface MetricsGridBlockConfig {
  type: "metrics-grid";
}

export interface MemberTableBlockConfig {
  type: "member-table";
  showPartyFilter?: boolean;
  /** Which metric columns to show. Defaults to all available. */
  columns?: Array<"attendance" | "rebelity" | "govity" | "corrections">;
}

export interface TextBlockConfig {
  type: "text";
  // content is in labels below
}

export type BlockConfig =
  | SwarmBlockConfig
  | ScatterBlockConfig
  | MetricsGridBlockConfig
  | MemberTableBlockConfig
  | TextBlockConfig;

// Translatable labels for a block
export interface BlockLabels {
  title?: string;
  description?: string;
  content?: string;  // for text blocks
}

// A single configurable page block
export interface PageBlock {
  id: string;                                    // unique within page, e.g. "attendance-swarm"
  config: BlockConfig;                           // type + type-specific options
  labels?: Record<string, BlockLabels>;          // keyed by lang code, e.g. "cs", "en"
}

// ─── Full parliament configuration ───────────────────────────────────────────

export interface ParliamentConfig {
  id: string;
  name: string;
  defaultLang: string;
  dataBase: string;
  analyses: string[];
  organizations: OrgTypeConfig[];
  translations: Record<string, ParliamentTranslations>;
  pages: {
    home: PageBlock[];
    memberDetail: PageBlock[];
    groupDetail: PageBlock[];
    regionDetail?: PageBlock[];
  };
  matomo?: {
    url: string;    // e.g. "//matomo.kohovolit.eu/"
    siteId: string; // e.g. "6"
  };
}
