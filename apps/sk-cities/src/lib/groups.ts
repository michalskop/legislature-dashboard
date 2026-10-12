// ID <-> slug helpers. Works for any city's IDs because the data standard's
// person/organization IDs always end in a unique, URL-safe segment
// (`<city>:person:<slug>`, `<city>:org:candidate-list:<slug>`, ...) — see
// legislature-data-standard's `dt.*` ID conventions. No per-city mapping
// table is needed (task A1's PLACEHOLDER_PARTY_* group->party mapping is
// gone — see parties.ts for why real IDs don't need one).

export function personSlug(personId: string): string {
  // "praha:person:katerina-arnotova" -> "katerina-arnotova"
  return personId.split(":").at(-1) ?? personId;
}

export function groupSlug(groupId: string): string {
  // "praha:org:candidate-list:starostove-a-nezavisli" -> "starostove-a-nezavisli"
  return groupId.split(":").at(-1) ?? groupId;
}

/**
 * A display/lookup key for party-branding metadata (colors, short names —
 * see parties.ts). Real organization IDs already end in a slug unique
 * within their city, so it doubles as the partyId without a separate
 * mapping table (task A1's GROUP_ID_TO_PARTY_ID placeholder dictionary is
 * gone: it existed only because the placeholder IDs were generic
 * "group-a"/"group-b" and needed a name; real candidate-list IDs already
 * carry one).
 */
export function groupIdToPartyId(groupId: string): string {
  return groupId.split(":").at(-1) ?? groupId;
}
