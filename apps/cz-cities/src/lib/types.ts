// Re-export shared types from parliament-core
export type { MpProfile, PartyProfile } from "@legislature/parliament-core";

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
  id: string; // "city:person:001" (placeholder namespace — see groups.ts)
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
  id: string; // "city:org:group-a" (placeholder namespace — see groups.ts)
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

// Constituency (kraj) summary
export interface KrajProfile {
  slug: string;        // URL-safe slug, e.g. "jihomoravsky-kraj"
  name: string;        // Original name, e.g. "Jihomoravský kraj"
  memberCount: number;
  avgAttendance: number | null;
  avgRebelity: number | null;
  avgGovity: number | null;
}

