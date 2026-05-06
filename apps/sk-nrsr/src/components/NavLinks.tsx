"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { parliamentConfig } from "@/lib/parliament.config";

function NavLink({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-sm transition-colors ${
        active
          ? "text-foreground font-semibold bg-surface-2"
          : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
      }`}
    >
      {label}
    </Link>
  );
}

interface Props {
  lang: string;
  langs: string[];
}

export function NavLinks({ lang, langs }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function switchLang(code: string) {
    document.cookie = `lang=${code}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  const t = parliamentConfig.translations[lang] ?? parliamentConfig.translations[parliamentConfig.defaultLang]!;
  const groupOrg = parliamentConfig.organizations.find((o) => o.classification === "group");
  const regionOrg = parliamentConfig.organizations.find((o) => o.classification === "constituency");

  const LINKS = [
    { href: "/",        label: t.nav.overview },
    { href: "/members", label: t.nav.members },
    { href: "/groups",  label: groupOrg?.labels[lang]?.plural ?? groupOrg?.labels[parliamentConfig.defaultLang]?.plural ?? "Groups" },
    ...(regionOrg ? [{ href: "/regions", label: regionOrg.labels[lang]?.plural ?? regionOrg.labels[parliamentConfig.defaultLang]?.plural ?? "Regions" }] : []),
  ];

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-1 text-sm font-medium">
        {LINKS.map(({ href, label }) => (
          <NavLink key={href} href={href} label={label} active={isActive(href)} />
        ))}
      </nav>

      {/* Desktop lang switcher */}
      {langs.length >= 2 && (
        <select
          value={lang}
          onChange={(e) => switchLang(e.target.value)}
          className="hidden sm:block text-xs font-medium bg-transparent text-muted-foreground hover:text-foreground border border-border rounded px-1.5 py-0.5 cursor-pointer transition-colors"
        >
          {langs.map((code) => (
            <option key={code} value={code}>{code.toUpperCase()}</option>
          ))}
        </select>
      )}

      {/* Mobile hamburger */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Zavřít menu" : "Otevřít menu"}
          className="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="17" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14" x2="17" y2="14" />
            </svg>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-surface-0 border border-border rounded-badge shadow-lg py-1 z-50 flex flex-col">
            {LINKS.map(({ href, label }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                active={isActive(href)}
                onClick={() => setOpen(false)}
              />
            ))}
            {langs.length >= 2 && (
              <div className="mt-1 pt-1 border-t border-border px-3 pb-1">
                <select
                  value={lang}
                  onChange={(e) => { switchLang(e.target.value); setOpen(false); }}
                  className="w-full text-xs font-medium bg-transparent text-muted-foreground border border-border rounded px-1.5 py-1 cursor-pointer"
                >
                  {langs.map((code) => (
                    <option key={code} value={code}>{code.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
