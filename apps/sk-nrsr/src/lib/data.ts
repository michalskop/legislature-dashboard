import type {
  AttendanceRecord,
  RebelityRecord,
  GovityRecord,
  WpcaRecord,
  CurrentMember,
  CurrentGroup,
  MpProfile,
  PartyProfile,
  KrajProfile,
} from "./types";
import { groupIdToPartyId, personSlug, groupSlug, constituencySlug } from "./groups";
import { parliamentConfig } from "./parliament.config";

const BASE = parliamentConfig.dataBase;

const REVALIDATE = 3600; // 1 hour

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  const text = await res.text();
  // Some files contain bare NaN (invalid JSON) — replace with null before parsing
  return JSON.parse(text.replace(/:\s*NaN/g, ": null")) as T;
}

// --- Raw fetchers ---

export function fetchAttendance() {
  return fetchJson<AttendanceRecord[]>("attendance/outputs/attendance.json");
}

export function fetchRebelity() {
  return fetchJson<RebelityRecord[]>("rebelity/outputs/rebelity.json");
}

export function fetchGovity() {
  return fetchJson<GovityRecord[]>("govity/outputs/govity.json");
}

export function fetchWpca() {
  return fetchJson<WpcaRecord[]>("wpca/outputs/wpca.json");
}

export function fetchCurrentMembers() {
  return fetchJson<CurrentMember[]>("current-members/outputs/current_members.json");
}

export function fetchCurrentGroups() {
  return fetchJson<CurrentGroup[]>("current-groups/outputs/current_groups.json");
}

export function fetchAllMembers() {
  return fetchJson<CurrentMember[]>("all-members/outputs/all_members.json");
}

// --- Combined MP profiles ---

export async function getAllMpProfiles(): Promise<MpProfile[]> {
  const [attendance, rebelity, govity, wpca, currentMembers, allMembers] =
    await Promise.all([
      fetchAttendance(),
      fetchRebelity(),
      fetchGovity(),
      fetchWpca(),
      fetchCurrentMembers(),
      fetchAllMembers(),
    ]);

  const currentIds = new Set(currentMembers.map((m) => m.id));

  const allMemberMap = new Map(allMembers.map((m) => [m.id, m]));

  const mandateMap = new Map(allMembers.map((m) => {
    const parl = m.memberships.parliament[m.memberships.parliament.length - 1];
    return [m.id, {
      mandateSince: parl?.start_date || null,
      mandateUntil: parl?.end_date || null,
    }];
  }));

  // Index secondary analyses by person_id
  const rebelityMap = new Map(rebelity.map((r) => [r.person_id, r]));
  const govityMap = new Map(govity.map((r) => [r.person_id, r]));
  const wpcaMap = new Map(wpca.map((r) => [r.person_id, r]));

  return attendance.map((a): MpProfile => {
    const orgs = a.organizations ?? [];
    const groupOrgs = orgs.filter((o) => o.classification === "group");
    const groupOrg = groupOrgs.find((o) => !o.until) ?? groupOrgs[groupOrgs.length - 1];
    const candidateOrg = orgs.find((o) => o.classification === "candidate_list");
    const constituencyOrg = orgs.find((o) => o.classification === "constituency");

    const isCurrent = currentIds.has(a.person_id);
    const groupId = groupOrg?.id ?? (isCurrent ? "nrsr:org:nezavisli" : null);
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
      mandateUntil: mandate?.mandateUntil || null,
      previousGroupIds,
      name: a.name,
      givenName: a.given_names[0] ?? "",
      familyName: a.family_names[0] ?? "",
      image: a.extras?.image ?? null,
      groupId,
      groupName: groupOrg?.name ?? candidateOrg?.name ?? (isCurrent ? "Nezávislí" : null),
      partyId,
      constituency: constituencyOrg?.name ?? null,
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

export async function getMpProfile(slug: string): Promise<MpProfile | null> {
  const all = await getAllMpProfiles();
  return all.find((mp) => mp.slug === slug) ?? null;
}

// --- Party profiles ---

export async function getAllPartyProfiles(): Promise<PartyProfile[]> {
  const [mps, groups] = await Promise.all([getAllMpProfiles(), fetchCurrentGroups()]);

  const groupMap = new Map(groups.map((g) => [g.id, g]));

  // Aggregate by groupId — all MPs (current and former)
  const byGroup = new Map<string, MpProfile[]>();
  for (const mp of mps) {
    if (!mp.groupId) continue;
    const arr = byGroup.get(mp.groupId) ?? [];
    arr.push(mp);
    byGroup.set(mp.groupId, arr);
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

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

// --- Kraj profiles ---

export async function getAllKrajProfiles(): Promise<KrajProfile[]> {
  const mps = await getAllMpProfiles();

  const byKraj = new Map<string, MpProfile[]>();
  for (const mp of mps.filter((m) => m.isCurrent)) {
    if (!mp.constituency) continue;
    const arr = byKraj.get(mp.constituency) ?? [];
    arr.push(mp);
    byKraj.set(mp.constituency, arr);
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  return Array.from(byKraj.entries())
    .map(([name, members]): KrajProfile => ({
      slug: constituencySlug(name),
      name,
      memberCount: members.length,
      avgAttendance: avg(members.map((m) => m.attendance?.present_share ?? NaN).filter(Number.isFinite)),
      avgRebelity: avg(members.map((m) => m.rebelity?.rebelity ?? NaN).filter(Number.isFinite)),
      avgGovity: avg(members.map((m) => m.govity?.govity ?? NaN).filter(Number.isFinite)),
    }))
    .sort((a, b) => b.memberCount - a.memberCount || a.name.localeCompare(b.name, "cs"));
}

export async function getKrajProfile(slug: string): Promise<{ kraj: KrajProfile; members: MpProfile[] } | null> {
  const [kraje, allMps] = await Promise.all([getAllKrajProfiles(), getAllMpProfiles()]);
  const kraj = kraje.find((k) => k.slug === slug);
  if (!kraj) return null;
  const members = allMps.filter((mp) => mp.constituency && constituencySlug(mp.constituency) === slug);
  return { kraj, members };
}

export async function getPartyProfile(slug: string): Promise<{ party: PartyProfile; members: MpProfile[] } | null> {
  const [parties, allMps] = await Promise.all([getAllPartyProfiles(), getAllMpProfiles()]);
  const party = parties.find((p) => p.slug === slug);
  if (!party) return null;

  const currentGroupMembers = allMps.filter((mp) => mp.groupId === party.groupId);
  const formerGroupMembers = allMps
    .filter((mp) => mp.groupId !== party.groupId && mp.previousGroupIds.includes(party.groupId))
    .map((mp) => ({ ...mp, isCurrent: false }));

  return { party, members: [...currentGroupMembers, ...formerGroupMembers] };
}
