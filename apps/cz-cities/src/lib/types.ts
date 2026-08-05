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

// A membership interval as it appears in current_members.json/all_members.json.
export interface MembershipInterval {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

// Current/all member roster record — the shape apps/cz-psp's data pipeline
// publishes as a dedicated "current_members"/"all_members" analysis. The
// city data pipeline does NOT (yet) produce this — see the derivation in
// lib/data.ts (deriveMembers()) and DIVERGENCE.md for the open question this
// raises for the project owner.
export interface CurrentMember {
  id: string; // "praha:person:katerina-arnotova"
  name: string;
  given_name: string;
  family_name: string;
  birth_date: string | null;
  gender: string | null;
  image: string | null;
  memberships: {
    parliament: MembershipInterval[];
    groups: MembershipInterval[];
    candidate_list: MembershipInterval[];
    constituency: MembershipInterval[];
  };
}

// Current group — same "derived, not published" caveat as CurrentMember.
export interface CurrentGroup {
  id: string; // "praha:org:candidate-list:starostove-a-nezavisli"
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
  // Unsupervised dimensions — which index (if any) correlates with real
  // government/opposition membership is NOT fixed by the analysis; it's
  // detected per-city/term (see GovernmentAxisRecord below), not assumed to
  // be dims[0]. Do not hardcode "dims[0]=x, dims[1]=y" against this array.
  dims: number[];
  weight: number;
  included: boolean;
  organizations: OrgMembership[];
}

// Sidecar written by cz-municipalities-votes-2022-2026's
// praha/scripts/detect_government_axis.py (NOT part of wpca.json itself,
// which is schema-validated — see that repo's praha/analyses/wpca/README-ish
// docstring). Records which WpcaRecord.dims[] index correlates with real
// government/opposition membership, via point-biserial correlation, so the
// dashboard never hardcodes a dimension index either.
export interface GovernmentAxisRecord {
  n_dims: number;
  correlations: { dim_index: number; correlation: number }[];
  detected_dim_index: number;
  override_dim_index: number | null;
  overridden: boolean;
  effective_dim_index: number;
  government_mean: number;
  opposition_mean: number;
  government_sign: number;
}

// NOTE: no KrajProfile/constituency type here — cities have no constituency
// organization, and the /region, /regions routes were removed entirely in
// task A2 (they were structurally dead for every city config, not just
// Praha — see DIVERGENCE.md).

