import type {
  AttendanceRecord,
  RebelityRecord,
  GovityRecord,
  WpcaRecord,
  CurrentMember,
  CurrentGroup,
  MpProfile,
  PartyProfile,
  MembershipInterval,
} from "./types";
import { groupIdToPartyId, personSlug, groupSlug } from "./groups";
import { parseCsv } from "./csv";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────────────────
// Data source — task A2. Real, committed local fixtures per city (populated
// from the owner-approved Praha data in cz-municipalities-votes-2022-2026,
// see DIVERGENCE.md "Real data instead of fictional placeholders"), read the
// same way A1 read placeholder fixtures: from disk, not the network. Once
// the city data repo is actually published and stable, swap `fetchAnalysisJson`
// and `readCityCsv` below to `fetch(cityConfig.dataBase + "/" + path)` /
// `fetch(rawTablesBase + "/" + table + ".csv")` — every call site is
// unchanged, only these two functions' bodies need to change.
//
// Layout mirrors the future real repo:
//   src/fixtures/<citySlug>/analyses/<analysis>/outputs/<analysis>.json
//   src/fixtures/<citySlug>/data/{persons,organizations,memberships}.csv
// ─────────────────────────────────────────────────────────────────────────

const FIXTURES_DIR = join(process.cwd(), "src/fixtures");

async function fetchAnalysisJson<T>(citySlug: string, path: string): Promise<T> {
  const text = await readFile(join(FIXTURES_DIR, citySlug, "analyses", path), "utf-8");
  // NaN-tolerant parse — some real analysis outputs contain bare `NaN`
  // (invalid JSON per RFC 8259; audit T4 tracks fixing this upstream).
  return JSON.parse(text.replace(/:\s*NaN/g, ": null")) as T;
}

async function readCityCsv(citySlug: string, table: string): Promise<Record<string, string>[]> {
  const text = await readFile(join(FIXTURES_DIR, citySlug, "data", `${table}.csv`), "utf-8");
  return parseCsv(text);
}

/** Safe column access for parsed CSV rows (tsconfig's noUncheckedIndexedAccess
 * means Record<string,string> indexing is `string | undefined`; every real
 * column in the standard tables this app reads is always present, so "" is
 * an unreachable-in-practice fallback, not a silent data-quality decision). */
function col(row: Record<string, string>, key: string): string {
  return row[key] ?? "";
}

// --- Raw analysis fetchers ---

export function fetchAttendance(citySlug: string) {
  return fetchAnalysisJson<AttendanceRecord[]>(citySlug, "attendance/outputs/attendance.json");
}

export function fetchRebelity(citySlug: string) {
  return fetchAnalysisJson<RebelityRecord[]>(citySlug, "rebelity/outputs/rebelity.json");
}

export function fetchGovity(citySlug: string) {
  return fetchAnalysisJson<GovityRecord[]>(citySlug, "govity/outputs/govity.json");
}

export function fetchWpca(citySlug: string) {
  return fetchAnalysisJson<WpcaRecord[]>(citySlug, "wpca/outputs/wpca.json");
}

// vote-corrections deliberately not fetched — cities don't publish
// corrections (plan.md D6); MpProfile.voteCorrections is always null below.

// ─────────────────────────────────────────────────────────────────────────
// Roster derivation (current_members / current_groups / all_members) —
// task A2's documented gap. apps/cz-psp's data pipeline publishes these as
// dedicated precomputed analyses (`current-members/outputs/current_members.json`
// etc.) alongside attendance/rebelity/govity/wpca. The city data pipeline
// (cz-municipalities-votes-2022-2026) does NOT — it only publishes the four
// analyses plus the raw standard tables (persons/organizations/memberships).
//
// Chosen approach here: derive the same shape directly from the raw tables,
// in the dashboard, at request time. A membership row with no end_date is
// "current" (matches the tables' own convention — see
// src/fixtures/praha/data/memberships.csv, `end_date` empty = still active).
// The "groups" vs "candidate_list" dual-write below mirrors the city
// pipeline's own `praha/scripts/build_all_members.py`: Praha's live
// klub/group data isn't scrapable, so group membership is sourced from each
// assembly member's original candidate-list affiliation instead (D7's documented
// fallback), and treated as `classification: "group"` for display — exactly
// how the four analysis outputs already model it (see e.g.
// src/fixtures/praha/analyses/attendance/outputs/attendance.json, which
// contains one `"group"` and one `"candidate_list"` entry per person for the
// same org id).
//
// OPEN QUESTION FOR THE PROJECT OWNER (flagged, not silently resolved):
// should the city data pipeline eventually publish current_members/
// current_groups/all_members as dedicated analyses (mirroring PSP), or
// should the dashboard always derive them from the raw tables the way this
// file does? Deriving them here means every dashboard that consumes this
// data repo re-implements the same "no end_date = current" + "candidate_list
// doubles as group" logic; publishing them as a pipeline analysis would
// match PSP's precedent and let non-dashboard consumers rely on it too, at
// the cost of one more analysis to keep in sync per city. Not resolved in
// A2 — see DIVERGENCE.md.
// ─────────────────────────────────────────────────────────────────────────

function toInterval(
  orgId: string,
  orgName: string,
  startDate: string,
  endDate: string,
): MembershipInterval {
  return {
    id: orgId,
    name: orgName,
    start_date: startDate || null,
    end_date: endDate || null,
  };
}

function isCurrent(interval: MembershipInterval): boolean {
  return interval.end_date === null;
}

async function deriveAllMembers(citySlug: string): Promise<CurrentMember[]> {
  const [persons, organizations, memberships] = await Promise.all([
    readCityCsv(citySlug, "persons"),
    readCityCsv(citySlug, "organizations"),
    readCityCsv(citySlug, "memberships"),
  ]);

  const orgById = new Map(organizations.map((o) => [col(o, "id"), o]));
  const membershipsByPerson = new Map<string, typeof memberships>();
  for (const m of memberships) {
    const personId = col(m, "person_id");
    const arr = membershipsByPerson.get(personId) ?? [];
    arr.push(m);
    membershipsByPerson.set(personId, arr);
  }

  return persons.map((p): CurrentMember => {
    const own = membershipsByPerson.get(col(p, "id")) ?? [];
    const parliament: MembershipInterval[] = [];
    const groups: MembershipInterval[] = [];
    const candidateList: MembershipInterval[] = [];

    for (const m of own) {
      const orgId = col(m, "organization_id");
      const org = orgById.get(orgId);
      const interval = toInterval(
        orgId,
        org ? col(org, "name") : orgId,
        col(m, "start_date"),
        col(m, "end_date"),
      );
      const classification = org ? col(org, "classification") : "";
      if (classification === "assembly" || classification === "parliament") {
        parliament.push(interval);
      } else if (classification === "candidate_list") {
        // Dual-write — see module doc above.
        groups.push(interval);
        candidateList.push({ ...interval });
      }
      // classification === "constituency" never occurs for cities.
    }

    return {
      id: col(p, "id"),
      name: col(p, "name"),
      given_name: col(p, "given_name"),
      family_name: col(p, "family_name"),
      // Not present in the raw standard tables for cities (persons.csv has
      // no birth_date/gender/image columns) — see D9 (person enrichment,
      // deferred). Real per-city portraits are a future enhancement.
      birth_date: null,
      gender: null,
      image: null,
      memberships: { parliament, groups, candidate_list: candidateList, constituency: [] },
    };
  });
}

export async function fetchAllMembers(citySlug: string): Promise<CurrentMember[]> {
  return deriveAllMembers(citySlug);
}

export async function fetchCurrentMembers(citySlug: string): Promise<CurrentMember[]> {
  const all = await deriveAllMembers(citySlug);
  return all.filter((m) => m.memberships.parliament.some(isCurrent));
}

export async function fetchCurrentGroups(citySlug: string): Promise<CurrentGroup[]> {
  const all = await deriveAllMembers(citySlug);
  const byId = new Map<string, CurrentGroup>();
  for (const m of all) {
    for (const g of m.memberships.groups) {
      if (isCurrent(g) && !byId.has(g.id)) {
        byId.set(g.id, { id: g.id, name: g.name, classification: "group" });
      }
    }
  }
  return Array.from(byId.values());
}

// --- Combined MP profiles ---

export async function getAllMpProfiles(citySlug: string): Promise<MpProfile[]> {
  const [attendance, rebelity, govity, wpca, currentMembers, allMembers] = await Promise.all([
    fetchAttendance(citySlug),
    fetchRebelity(citySlug),
    fetchGovity(citySlug),
    fetchWpca(citySlug),
    fetchCurrentMembers(citySlug),
    fetchAllMembers(citySlug),
  ]);

  const currentIds = new Set(currentMembers.map((m) => m.id));
  const allMemberMap = new Map(allMembers.map((m) => [m.id, m]));

  const mandateMap = new Map(
    allMembers.map((m) => {
      const parl = m.memberships.parliament[m.memberships.parliament.length - 1];
      return [m.id, { mandateSince: parl?.start_date ?? null, mandateUntil: parl?.end_date ?? null }];
    }),
  );

  const rebelityMap = new Map(rebelity.map((r) => [r.person_id, r]));
  const govityMap = new Map(govity.map((r) => [r.person_id, r]));
  const wpcaMap = new Map(wpca.map((r) => [r.person_id, r]));

  return attendance.map((a): MpProfile => {
    const groupOrg = a.organizations.find((o) => o.classification === "group");
    const candidateOrg = a.organizations.find((o) => o.classification === "candidate_list");

    const groupId = groupOrg?.id ?? null;
    const partyId = groupId ? groupIdToPartyId(groupId) : null;

    const reb = rebelityMap.get(a.person_id);
    const gov = govityMap.get(a.person_id);
    const w = wpcaMap.get(a.person_id);

    const mandate = mandateMap.get(a.person_id);
    const allMemberRecord = allMemberMap.get(a.person_id);
    const previousGroupIds = (allMemberRecord?.memberships.groups ?? [])
      .filter((g) => g.end_date)
      .map((g) => g.id);

    return {
      personId: a.person_id,
      slug: personSlug(a.person_id),
      isCurrent: currentIds.has(a.person_id),
      mandateSince: mandate?.mandateSince ?? null,
      mandateUntil: mandate?.mandateUntil ?? null,
      previousGroupIds,
      name: a.name,
      givenName: a.given_names[0] ?? "",
      familyName: a.family_names[0] ?? "",
      image: a.extras?.image ?? null,
      groupId,
      groupName: groupOrg?.name ?? candidateOrg?.name ?? null,
      partyId,
      constituency: null, // cities have no constituency organization
      attendance: {
        present_share: a.present_share,
        present: a.present,
        absent: a.absent,
        vote_events_total: a.vote_events_total,
      },
      rebelity: reb
        ? { rebelity: reb.rebelity, rebelity_total: reb.rebelity_total, rebelity_possible: reb.rebelity_possible }
        : null,
      govity: gov
        ? { govity: gov.govity, govity_total: gov.govity_total, govity_possible: gov.govity_possible }
        : null,
      voteCorrections: null,
      wpca: w && w.included
        ? { x: w.dims[0] ?? 0, y: w.dims[1] ?? 0, weight: w.weight, included: w.included }
        : null,
    };
  });
}

export async function getMpProfile(citySlug: string, slug: string): Promise<MpProfile | null> {
  const all = await getAllMpProfiles(citySlug);
  return all.find((mp) => mp.slug === slug) ?? null;
}

// --- Party profiles ---

export async function getAllPartyProfiles(citySlug: string): Promise<PartyProfile[]> {
  const [mps, groups] = await Promise.all([getAllMpProfiles(citySlug), fetchCurrentGroups(citySlug)]);

  const groupMap = new Map(groups.map((g) => [g.id, g]));

  const byGroup = new Map<string, MpProfile[]>();
  for (const mp of mps) {
    if (!mp.groupId) continue;
    const arr = byGroup.get(mp.groupId) ?? [];
    arr.push(mp);
    byGroup.set(mp.groupId, arr);
  }

  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  const parties: PartyProfile[] = [];
  for (const [gid, members] of byGroup.entries()) {
    const group = groupMap.get(gid);
    const name = group?.name ?? members[0]?.groupName ?? gid;
    const currentMembers = members.filter((m) => m.isCurrent);

    const attendanceValues = currentMembers
      .map((m) => m.attendance?.present_share)
      .filter((v): v is number => v !== undefined && v !== null);
    const rebelityValues = currentMembers
      .map((m) => m.rebelity?.rebelity)
      .filter((v): v is number => v !== undefined && v !== null);
    const govityValues = currentMembers
      .map((m) => m.govity?.govity)
      .filter((v): v is number => v !== undefined && v !== null);

    parties.push({
      groupId: gid,
      slug: groupSlug(gid),
      name,
      partyId: groupIdToPartyId(gid),
      memberCount: currentMembers.length,
      avgAttendance: avg(attendanceValues),
      avgRebelity: avg(rebelityValues),
      avgGovity: avg(govityValues),
    });
  }

  return parties.sort((a, b) => b.memberCount - a.memberCount);
}

export async function getPartyProfile(
  citySlug: string,
  slug: string,
): Promise<{ party: PartyProfile; members: MpProfile[] } | null> {
  const [parties, allMps] = await Promise.all([getAllPartyProfiles(citySlug), getAllMpProfiles(citySlug)]);
  const party = parties.find((p) => p.slug === slug);
  if (!party) return null;

  const currentGroupMembers = allMps.filter((mp) => mp.groupId === party.groupId);
  const formerGroupMembers = allMps
    .filter((mp) => mp.groupId !== party.groupId && mp.previousGroupIds.includes(party.groupId))
    .map((mp) => ({ ...mp, isCurrent: false }));

  return { party, members: [...currentGroupMembers, ...formerGroupMembers] };
}
