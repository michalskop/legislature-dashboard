// Map from nrsr group org ID → party badge ID (used in PartyBadge)
// IDs are sequential based on sorted canonical club names (after alias merging in standardize.py)
export const GROUP_ID_TO_PARTY_ID: Record<string, string> = {
  "nrsr:org:club:1": "hlas",      // Klub HLAS - sociálna demokracia
  "nrsr:org:club:2": "kdh",       // Klub KDH
  "nrsr:org:club:3": "ps",        // Klub Progresívne Slovensko
  "nrsr:org:club:4": "slovensko", // Klub SLOVENSKO - ZA ĽUDÍ
  "nrsr:org:club:5": "smer",      // Klub SMER - sociálna demokracia
  "nrsr:org:club:6": "sas",       // Klub Sloboda a Solidarita
  "nrsr:org:club:7": "sns",       // Klub Slovenská národná strana
  // independent MPs (not members of any club)
  "nrsr:org:nezavisli": "nezavisli",
};

export function groupIdToPartyId(groupId: string): string {
  return GROUP_ID_TO_PARTY_ID[groupId] ?? "other";
}

export function personSlug(personId: string): string {
  // "nrsr:person:1009" → "1009"
  return personId.split(":").at(-1) ?? personId;
}

export function groupSlug(groupId: string): string {
  // "nrsr:org:club:5" → "5"
  return groupId.split(":").at(-1) ?? groupId;
}

export function slugToPersonId(slug: string): string {
  return `nrsr:person:${slug}`;
}

export function slugToGroupId(slug: string): string {
  return `nrsr:org:club:${slug}`;
}

const SLOVAK_MAP: Record<string, string> = {
  á: "a", ä: "a", č: "c", ď: "d", é: "e", í: "i",
  ľ: "l", ĺ: "l", ň: "n", ó: "o", ô: "o", ŕ: "r",
  š: "s", ť: "t", ú: "u", ý: "y", ž: "z",
};

export function constituencySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[áäčďéíľĺňóôŕšťúýž]/g, (c) => SLOVAK_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
