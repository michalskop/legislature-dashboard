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
  const rest = current === DEFAULT_LANG ? pathname : pathname.slice(`/${current}`.length) || "/";

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
