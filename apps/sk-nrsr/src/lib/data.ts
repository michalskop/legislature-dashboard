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

// --- Combined MP profiles ---

export async function getAllMpProfiles(): Promise<MpProfile[]> {
  const [attendance, rebelity, govity, wpca, currentMembers] =
    await Promise.all([
      fetchAttendance(),
      fetchRebelity(),
      fetchGovity(),
      fetchWpca(),
      fetchCurrentMembers(),
    ]);

  const currentIds = new Set(currentMembers.map((m) => m.id));

  // Index secondary analyses by person_id
  const rebelityMap = new Map(rebelity.map((r) => [r.person_id, r]));
  const govityMap = new Map(govity.map((r) => [r.person_id, r]));
  const wpcaMap = new Map(wpca.map((r) => [r.person_id, r]));

  return attendance.map((a): MpProfile => {
    const orgs = a.organizations ?? [];
    const groupOrg = orgs.find((o) => o.classification === "group");
    const candidateOrg = orgs.find((o) => o.classification === "candidate_list");
    const constituencyOrg = orgs.find((o) => o.classification === "constituency");

    const groupId = groupOrg?.id ?? null;
    const partyId = groupId ? groupIdToPartyId(groupId) : null;

    const reb = rebelityMap.get(a.person_id);
    const gov = govityMap.get(a.person_id);
    const w = wpcaMap.get(a.person_id);

    return {
      personId: a.person_id,
      slug: personSlug(a.person_id),
      isCurrent: currentIds.has(a.person_id),
      name: a.name,
      givenName: a.given_names[0] ?? "",
      familyName: a.family_names[0] ?? "",
      image: a.extras?.image ?? null,
      groupId,
      groupName: groupOrg?.name ?? candidateOrg?.name ?? null,
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

  // Aggregate by groupId — current MPs only
  const byGroup = new Map<string, MpProfile[]>();
  for (const mp of mps.filter((m) => m.isCurrent)) {
    if (!mp.groupId) continue;
    const arr = byGroup.get(mp.groupId) ?? [];
    arr.push(mp);
    byGroup.set(mp.groupId, arr);
  }

  const parties: PartyProfile[] = [];
  for (const [gid, members] of byGroup.entries()) {
    const group = groupMap.get(gid);
    const name = group?.name ?? members[0]?.groupName ?? gid;

    const attendanceValues = members
      .map((m) => m.attendance?.present_share)
      .filter((v): v is number => v !== undefined && v !== null);
    const rebelityValues = members
      .map((m) => m.rebelity?.rebelity)
      .filter((v): v is number => v !== undefined && v !== null);
    const govityValues = members
      .map((m) => m.govity?.govity)
      .filter((v): v is number => v !== undefined && v !== null);

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    parties.push({
      groupId: gid,
      slug: groupSlug(gid),
      name,
      partyId: groupIdToPartyId(gid),
      memberCount: members.length,
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
  const members = allMps.filter((mp) => mp.groupId === party.groupId);
  return { party, members };
}
