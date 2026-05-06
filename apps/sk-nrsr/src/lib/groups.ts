// Map from nrsr group org ID → party badge ID (used in PartyBadge)
export const GROUP_ID_TO_PARTY_ID: Record<string, string> = {
  "nrsr:org:club:1": "hlas",      // HLAS - SD
  "nrsr:org:club:2": "hlas",      // HLAS - sociálna demokracia
  "nrsr:org:club:3": "kdh",       // KDH
  "nrsr:org:club:4": "ps",        // PS
  "nrsr:org:club:5": "ps",        // Progresívne Slovensko
  "nrsr:org:club:6": "slovensko", // SLOVENSKO
  "nrsr:org:club:7": "slovensko", // SLOVENSKO - ZA ĽUDÍ
  "nrsr:org:club:8": "smer",      // SMER - SD
  "nrsr:org:club:9": "smer",      // SMER - sociálna demokracia
  "nrsr:org:club:10": "sns",      // SNS
  "nrsr:org:club:11": "sas",      // SaS
  "nrsr:org:club:12": "sas",      // Sloboda a Solidarita
  "nrsr:org:club:13": "sns",      // Slovenská národná strana
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
