// ─────────────────────────────────────────────────────────────────────────
// Language list — task A2 (plan.md D5). This is the ONE place that lists
// which languages the site supports, and which one is unprefixed.
//
// D5: "the language list must be pure config + dictionaries, never a
// hardcoded pair" — this app is a template/pilot for other countries
// (e.g. Slovakia incl. Hungarian minority), so adding a language (uk, vi,
// hu, ...) must cost only: (1) one entry here, (2) a dictionary in each
// city's `translations` map (see lib/city.config.ts). No route file, no
// component, and no middleware code should ever hardcode "cs"/"en" as an
// exhaustive pair — see the dummy `xx` language proof in the A2 commit
// message for a from-scratch verification of this claim.
// ─────────────────────────────────────────────────────────────────────────

export interface LangDef {
  code: string;
  /** Exactly one language must be `default: true` — it is served unprefixed. */
  default?: boolean;
}

export const LANGS: LangDef[] = [
  { code: "cs", default: true },
  { code: "en" },
];

export const LANG_CODES: string[] = LANGS.map((l) => l.code);

const defaultLangDef = LANGS.find((l) => l.default);
if (!defaultLangDef) {
  throw new Error("lib/i18n.ts: exactly one entry in LANGS must have default: true");
}
export const DEFAULT_LANG: string = defaultLangDef.code;

export function isValidLang(code: string): code is string {
  return LANG_CODES.includes(code);
}
