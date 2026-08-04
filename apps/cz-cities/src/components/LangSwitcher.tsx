"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGS, DEFAULT_LANG } from "@/lib/i18n";

interface Props {
  current: string;
}

/**
 * Real navigation between the parallel URL in each configured language —
 * task A2 (plan.md D5 / audit T8). Replaces A1's cookie-write +
 * router.refresh(): this renders one real <Link> per language pointing at
 * the actual localized URL for the current page (e.g. from
 * /praha/members to /en/praha/members), computed purely from the visible
 * pathname — no cookies, no client-side language state.
 */
export function LangSwitcher({ current }: Props) {
  const pathname = usePathname();

  if (LANGS.length < 2) return null;

  // Strip the current language's own prefix (if any) to get the
  // language-agnostic rest of the path, then re-prefix per target language.
  //
  // The prefix must be stripped whenever it is actually present — NOT only
  // for non-default languages. `usePathname()` does not return the same value
  // on the server and on the client for default-language pages: middleware.ts
  // rewrites the public `/praha` to the internal `/cs/praha`, and during
  // prerender/SSR `usePathname()` sees the *internal* (rewritten) path, while
  // after hydration it sees the *public* (unprefixed) one. Assuming
  // "default language => no prefix present" therefore produced hrefs like
  // `/en/cs/praha` (a real 404) in the prerendered HTML that crawlers and
  // no-JS users receive, plus a hydration mismatch on every default-language
  // page. Checking for the prefix explicitly is correct under both values.
  const prefix = `/${current}`;
  const hasPrefix =
    pathname === prefix || pathname.startsWith(`${prefix}/`);
  const rest = hasPrefix ? pathname.slice(prefix.length) || "/" : pathname;

  function hrefFor(code: string): string {
    if (code === DEFAULT_LANG) return rest;
    return `/${code}${rest === "/" ? "" : rest}`;
  }

  return (
    <div className="flex items-center gap-1 text-xs font-medium">
      {LANGS.map(({ code }) => {
        const active = code === current;
        return (
          <Link
            key={code}
            href={hrefFor(code)}
            aria-current={active ? "true" : undefined}
            className={`border border-border rounded px-1.5 py-0.5 transition-colors ${
              active
                ? "text-foreground font-semibold bg-surface-2"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {code.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
