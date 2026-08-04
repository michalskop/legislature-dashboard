"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { CityConfig } from "@/lib/city.config";
import { getCityTranslations } from "@/lib/city.config";
import { getSiteTranslations } from "@/lib/site";
import { cityBasePath, globalBasePath } from "@/lib/routing";
import { LangSwitcher } from "@/components/LangSwitcher";

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
  city: CityConfig;
}

export function NavLinks({ lang, city }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const t = getCityTranslations(city, lang);
  const site = getSiteTranslations(lang);
  const groupOrg = city.organizations.find((o) => o.classification === "group");
  const basePath = cityBasePath(lang, city.citySlug);

  function isActive(href: string) {
    return href === basePath ? pathname === href : pathname.startsWith(href);
  }

  const LINKS = [
    { href: basePath, label: t.nav.overview },
    { href: `${basePath}/members`, label: t.nav.members },
    { href: `${basePath}/groups`, label: groupOrg?.labels[lang]?.plural ?? groupOrg?.labels[city.defaultLang]?.plural ?? "Groups" },
    { href: `${globalBasePath(lang)}/about`, label: site.aboutNavLabel },
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
      <div className="hidden sm:block">
        <LangSwitcher current={lang} />
      </div>

      {/* Mobile hamburger */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
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
            <div className="mt-1 pt-1 border-t border-border px-3 pb-1">
              <LangSwitcher current={lang} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
