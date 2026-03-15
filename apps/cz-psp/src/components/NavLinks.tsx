"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",         label: "Přehled" },
  { href: "/poslanci", label: "Poslanci" },
  { href: "/strany",   label: "Strany" },
  { href: "/kraje",    label: "Kraje" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-sm font-medium">
      {LINKS.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-sm transition-colors ${
              active
                ? "text-foreground font-semibold bg-surface-2"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
