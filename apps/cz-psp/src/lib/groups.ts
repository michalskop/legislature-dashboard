// Map from psp group org ID → party badge ID (used in PartyBadge)
export const GROUP_ID_TO_PARTY_ID: Record<string, string> = {
  "psp:org:1750": "ano",       // ANO 2011
  "psp:org:1748": "kdu",       // KDU-ČSL
  "psp:org:1749": "motoriste", // Motoristé sobě
  "psp:org:1751": "ods",       // ODS
  "psp:org:1745": "pirati",    // Piráti
  "psp:org:1752": "stan",      // Starostové a nezávislí
  "psp:org:1746": "spd",       // Svoboda a přímá demokracie
  "psp:org:1747": "top09",     // TOP 09
};

export function groupIdToPartyId(groupId: string): string {
  return GROUP_ID_TO_PARTY_ID[groupId] ?? "other";
}

export function personSlug(personId: string): string {
  // "psp:person:6491" → "6491"
  return personId.split(":").at(-1) ?? personId;
}

export function groupSlug(groupId: string): string {
  // "psp:org:1750" → "1750"
  return groupId.split(":").at(-1) ?? groupId;
}

export function slugToPersonId(slug: string): string {
  return `psp:person:${slug}`;
}

export function slugToGroupId(slug: string): string {
  return `psp:org:${slug}`;
}

const CZECH_MAP: Record<string, string> = {
  á: "a", č: "c", ď: "d", é: "e", ě: "e", í: "i",
  ň: "n", ó: "o", ř: "r", š: "s", ť: "t", ú: "u",
  ů: "u", ý: "y", ž: "z",
};

export function constituencySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[áčďéěíňóřšťúůýž]/g, (c) => CZECH_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
