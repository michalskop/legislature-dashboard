// PLACEHOLDER mapping for the generic scaffold (task A1). IDs use a "city:"
// namespace prefix (not a real city) — a real city (e.g. "praha:org:...")
// will replace this in task A2 once real data exists. See parties.ts for the
// matching color/label metadata (kept local to this app, not in
// @legislature/ui, since those PSP/NRSR dictionaries are hardcoded per-app —
// see DIVERGENCE.md).
export const GROUP_ID_TO_PARTY_ID: Record<string, string> = {
  "city:org:group-a": "placeholder-a",
  "city:org:group-b": "placeholder-b",
  "city:org:group-c": "placeholder-c",
};

export function groupIdToPartyId(groupId: string): string {
  return GROUP_ID_TO_PARTY_ID[groupId] ?? "other";
}

export function personSlug(personId: string): string {
  // "city:person:001" → "001"
  return personId.split(":").at(-1) ?? personId;
}

export function groupSlug(groupId: string): string {
  // "city:org:group-a" → "group-a"
  return groupId.split(":").at(-1) ?? groupId;
}

export function slugToPersonId(slug: string): string {
  return `city:person:${slug}`;
}

export function slugToGroupId(slug: string): string {
  return `city:org:${slug}`;
}

const CZECH_MAP: Record<string, string> = {
  á: "a", č: "c", ď: "d", é: "e", ě: "e", í: "i",
  ň: "n", ó: "o", ř: "r", š: "s", ť: "t", ú: "u",
  ů: "u", ý: "y", ž: "z",
};

// Kept for template parity with cz-psp/sk-nrsr even though this scaffold's
// config has no constituency organization (see parliament.config.ts).
export function constituencySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[áčďéěíňóřšťúůýž]/g, (c) => CZECH_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
