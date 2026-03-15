import Link from "next/link";
import { SnemovnaLogotype } from "@/components/SnemovnaLogotype";
import { NavLinks } from "@/components/NavLinks";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border bg-surface-0">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <SnemovnaLogotype size="md" />
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
