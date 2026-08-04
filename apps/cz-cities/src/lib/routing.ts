// Pure, framework-agnostic URL helpers shared by server components, client
// components (LangSwitcher, NavLinks) and middleware.ts. No `cookies()`, no
// `next/headers` — see plan.md D5 / audit T8 for why that matters (calling
// cookies() anywhere in the request path forces dynamic rendering).
//
// URL shape (task A2): cs (DEFAULT_LANG) is served unprefixed, every other
// language is prefixed. Examples:
//   cityBasePath("cs", "praha")  -> "/praha"
//   cityBasePath("en", "praha")  -> "/en/praha"
//   globalBasePath("cs")         -> ""     (i.e. "/", "/about")
//   globalBasePath("en")         -> "/en"  (i.e. "/en", "/en/about")

import { DEFAULT_LANG } from "./i18n";

/** Base path (no trailing slash) for a given city in a given language. */
export function cityBasePath(lang: string, citySlug: string): string {
  return lang === DEFAULT_LANG ? `/${citySlug}` : `/${lang}/${citySlug}`;
}

/** Base path (no trailing slash, possibly "") for site-global (non-city) pages. */
export function globalBasePath(lang: string): string {
  return lang === DEFAULT_LANG ? "" : `/${lang}`;
}
