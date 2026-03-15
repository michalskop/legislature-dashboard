// Organization membership entry (appears in all analysis outputs)
export interface OrgMembership {
  id: string;
  name: string;
  classification: string;
  since?: string;
  until?: string;
}

// Current member (from current_members.json)
export interface CurrentMember {
  id: string; // "psp:person:6491"
  name: string;
  given_name: string;
  family_name: string;
  birth_date: string | null;
  gender: string | null;
  image: string | null;
  memberships: {
    parliament: Array<{ id: string; name: string; start_date: string; end_date: string }>;
    groups: Array<{ id: string; name: string; start_date: string; end_date: string }>;
    candidate_list: Array<{ id: string; name: string; start_date: string; end_date: string }>;
    constituency: Array<{ id: string; name: string; start_date: string; end_date: string }>;
  };
}

// Current group (from current_groups.json)
export interface CurrentGroup {
  id: string; // "psp:org:1750"
  name: string;
  classification: string;
}

// Attendance analysis output
export interface AttendanceRecord {
  person_id: string;
  name: string;
  given_names: string[];
  family_names: string[];
  vote_events_total: number;
  present: number;
  absent: number;
  present_share: number;
  organizations: OrgMembership[];
  extras?: { image?: string };
}

// Rebelity analysis output
export interface RebelityRecord {
  person_id: string;
  name: string;
  given_names: string[];
  family_names: string[];
  rebelity_total: number;
  rebelity_possible: number;
  rebelity: number;
  organizations: OrgMembership[];
  extras?: { image?: string };
}

// Govity analysis output
export interface GovityRecord {
  person_id: string;
  name: string;
  given_names: string[];
  family_names: string[];
  govity_total: number;
  govity_possible: number;
  govity: number;
  organizations: OrgMembership[];
  extras?: { image?: string };
}

// Vote corrections analysis output
export interface VoteCorrectionsRecord {
  person_id: string;
  name: string;
  given_names: string[];
  family_names: string[];
  corrections_total: number;
  corrections_invalidated: number;
  corrections_announced: number;
  vote_events_total: number;
  organizations: OrgMembership[];
  extras?: { image?: string };
}

// WPCA analysis output
export interface WpcaRecord {
  person_id: string;
  name: string;
  given_names: string[];
  family_names: string[];
  dims: number[]; // dims[0]=x, dims[1]=y for scatterplot
  weight: number;
  included: boolean;
  organizations: OrgMembership[];
}

// Combined MP profile (all analyses joined by person_id)
export interface MpProfile {
  personId: string; // "psp:person:6491"
  slug: string;     // "6491"
  name: string;
  isCurrent: boolean; // true = active member, false = former member
  givenName: string;
  familyName: string;
  image: string | null;
  groupId: string | null;   // "psp:org:1750"
  groupName: string | null; // "ANO 2011"
  partyId: string | null;   // "ano" (badge ID)
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

// Constituency (kraj) summary
export interface KrajProfile {
  slug: string;        // URL-safe slug, e.g. "jihomoravsky-kraj"
  name: string;        // Original name, e.g. "Jihomoravský kraj"
  memberCount: number;
  avgAttendance: number | null;
  avgRebelity: number | null;
  avgGovity: number | null;
}

// Party summary (aggregated from member profiles)
export interface PartyProfile {
  groupId: string;   // "psp:org:1750"
  slug: string;      // "1750"
  name: string;      // "ANO 2011"
  partyId: string;   // "ano"
  memberCount: number;
  avgAttendance: number | null;
  avgRebelity: number | null;
  avgGovity: number | null;
}
