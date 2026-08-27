import type {
  AttendanceRecord,
  RebelityRecord,
  GovityRecord,
  WpcaRecord,
  GovernmentAxisRecord,
  CurrentMember,
  CurrentGroup,
  MpProfile,
  PartyProfile,
  MembershipInterval,
} from "./types";
import { groupIdToPartyId, personSlug, groupSlug } from "./groups";
import { parseCsv } from "./csv";
import { getCityConfig } from "./city.config";

// ─────────────────────────────────────────────────────────────────────────
// Data source — swapped 2026-08-27 from committed local fixtures (task A2's
// original approach, see git history for that version of this file) to real
// `fetch()` calls against the city data repo's raw GitHub URLs, mirroring
// apps/cz-psp/src/lib/data.ts's established BASE/REVALIDATE/fetchJson
// pattern exactly (same NaN-tolerant text-replace-before-parse, same
// `next: { revalidate }` ISR hint). This was the deferred half of task A2 —
// the city data repo (cz-municipalities-votes-2022-2026) now has real
// nightly automation for both Praha and Brno (G4/G7 gates, committed
// straight to `main`), so "wait until it's published and stable" no longer
// applies.
//
// `cityConfig.dataBase` is the analyses root (e.g.
// ".../praha/analyses"); `rawTablesBase` below derives the sibling raw-table
// root (".../praha/data") the same way city.config.ts's own comment always
// said this file would.
// ─────────────────────────────────────────────────────────────────────────

const REVALIDATE = 3600; // 1 hour — same cadence as apps/cz-psp/src/lib/data.ts

function dataBaseFor(citySlug: string): string {
  const city = getCityConfig(citySlug);
  if (!city) throw new Error(`Unknown citySlug: ${citySlug}`);
  return city.dataBase;
}

function rawTablesBaseFor(citySlug: string): string {
  return dataBaseFor(citySlug).replace(/\/analyses$/, "/data");
}

async function fetchAnalysisJson<T>(citySlug: string, path: string): Promise<T> {
  const url = `${dataBaseFor(citySlug)}/${path}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  // NaN-tolerant parse — some real analysis outputs contain bare `NaN`
  // (invalid JSON per RFC 8259; audit T4 tracks fixing this upstream).
  return JSON.parse(text.replace(/:\s*NaN/g, ": null")) as T;
}

async function readCityCsv(citySlug: string, table: string): Promise<Record<string, string>[]> {
  const url = `${rawTablesBaseFor(citySlug)}/${table}.csv`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return parseCsv(await res.text());
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

// Sidecar from cz-municipalities-votes-2022-2026's detect_government_axis.py
// (praha/analyses/wpca/outputs/government_axis.json) — which WpcaRecord
// dims[] index correlates with real government/opposition membership.
//
// Owner reversal (2026-08-05, DIVERGENCE.md §8 (a)): this used to also drive
// *which raw dimension* fed wpca.x/wpca.y (see git history's `pickWpcaAxes`).
// That's reverted — `getAllMpProfiles` below now always maps x=dims[0],
// y=dims[1], full stop. `effective_dim_index` is read only for *label*
// placement (which axis gets the "Koalice | Opozice"-style text) — see
// `getGovernmentAxisPlacement` below and its call sites in the page
// components.
export function fetchGovernmentAxis(citySlug: string) {
  return fetchAnalysisJson<GovernmentAxisRecord>(citySlug, "wpca/outputs/government_axis.json");
}

// Where the detected government/opposition axis renders, and which end of it
// government is on. `onX` decides which chart axis (x=dims[0] or y=dims[1],
// both fixed — see getAllMpProfiles below) gets the coalition/opposition
// label vs. the neutral "other dimension" label. `sign` (government_axis
// .json's government_sign, +1 or -1) decides the *word order* within that
// label: owner fix (2026-08-05, DIVERGENCE.md §8 round 4) — the label must
// read so that the word appearing after the arrows (the "higher/further"
// end) matches whichever end government is actually on, not a fixed
// "Koalice | Opozice" order regardless of sign. See the three [lang]/[city]
// page components' chartLabels construction for how this is applied.
export async function getGovernmentAxisPlacement(
  citySlug: string,
): Promise<{ onX: boolean; sign: number }> {
  const axis = await fetchGovernmentAxis(citySlug);
  return { onX: axis.effective_dim_index === 0, sign: axis.government_sign };
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
        // Dual-write — see module doc above. Praha's D7 fallback: no live
        // klub data, so group membership is sourced from (and doubles as)
        // each member's 2022 candidate-list affiliation.
        groups.push(interval);
        candidateList.push({ ...interval });
      } else if (classification === "group") {
        // Brno (added 2026-08-27): real, live klub data straight from the
        // source feed (D7's preferred case, not a candidate-list fallback)
        // — see brno/scripts/party_affiliation.py in the city data repo.
        // Single-write only: this genuinely isn't candidate-list-origin
        // data, so it must not also land in `candidateList` the way
        // Praha's fallback does.
        groups.push(interval);
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
    // Praha reconciliation (2026-08-06, DIVERGENCE.md §10): a person can now
    // have a "group" organizations entry that has ENDED while they remain a
    // current assembly member (Hana Kordová Marvanová — excluded from the
    // SPOLU pro Prahu klub 2023-02-17, still a sitting independent). Picking
    // *any* group entry regardless of `until` (the old behavior) would keep
    // attributing her to SPOLU forever. Only a still-open group entry counts
    // as this person's CURRENT group/party — a closed one means "no current
    // party" (falls through to null -> the "other"/unaffiliated bucket in
    // PARTY_META), with the historical fact preserved separately via
    // `previousGroupIds` below (already end_date-filtered, unaffected by
    // this change).
    const groupOrg = a.organizations.find((o) => o.classification === "group" && !o.until);
    const candidateOrg = a.organizations.find((o) => o.classification === "candidate_list" && !o.until);

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
      // x=dims[0], y=dims[1], always — fixed (owner reversal, 2026-08-05,
      // DIVERGENCE.md §8 (a)). §7 (2026-08-05) had made this dynamic,
      // remapping whichever dims[] index the government_axis.json sidecar
      // flagged as government-separating onto x. That's reverted: the raw
      // dimensions no longer get swapped based on which one happens to
      // separate government/opposition. `effective_dim_index` is still read
      // (see isGovernmentAxisOnX above), but only for *label* placement in
      // the page components — never to pick which dims[] value feeds x/y.
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
      // Reconsidered again (2026-08-06, DIVERGENCE.md §10) after the
      // praha.eu reconciliation. The 2026-08-05 "owner fix" switched this
      // from `currentMembers.length` to `members.length` (everyone who ever
      // held this group's seat) to fix an undercount — but full-term
      // distinct-person counting has the opposite failure mode: it
      // OVERcounts whenever a seat changed hands mid-term and the data has
      // both people (e.g. ANO 2011's Hrubčík->Kaněra swap, already in the
      // data, plus this round's Prokop->Ševčíková swap, would have made
      // `members.length` read 16 for a party that actually has 14 seats).
      // That failure mode wasn't hypothetical — it was one Election Day
      // away from being wrong the moment a second mid-term replacement
      // landed in the data, which is exactly what happened this round.
      //
      // The actual root cause of the original undercount wasn't the
      // formula, it was `groupOrg` selection (above, in getAllMpProfiles)
      // not filtering for a CURRENT group entry — so a departed member
      // with no in-data replacement (STAN's David Procházka, before Michal
      // Biskup existed in this data at all) just vanished from every
      // count, current or full-term. Now that (a) that selection bug is
      // fixed and (b) live praha.eu data (not just the stale, months-old
      // Golemio CSV) is reconciled into persons/memberships.csv, `members`
      // here already only contains people with a CURRENTLY open group
      // membership — so `members.length` and `currentMembers.length` are
      // computed from the same already-current-filtered array either way.
      // `currentMembers.length` is used explicitly (not `members.length`)
      // because it also requires assembly-currency, not just group-currency
      // — belt-and-suspenders against a hypothetical future data row with an
      // open candidate-list membership but a closed assembly one (shouldn't
      // happen given how this pipeline mirrors the two dates, but "shouldn't
      // happen" isn't a schema guarantee). This also matches the average
      // stat columns' scope (attendance/rebelity/govity below), which were
      // never in dispute — memberCount now means the same "currently active
      // members of this group" as those averages, not a different, broader
      // population.
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
