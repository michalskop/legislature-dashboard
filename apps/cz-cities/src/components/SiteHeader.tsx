import Link from "next/link";
import { CityLogotype } from "@/components/CityLogotype";
import { NavLinks } from "@/components/NavLinks";
import type { CityConfig } from "@/lib/city.config";
import { cityBasePath } from "@/lib/routing";

interface Props {
  lang: string;
  city: CityConfig;
}

export function SiteHeader({ lang, city }: Props) {
  return (
    <header className="w-full border-b border-border bg-surface-0">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href={cityBasePath(lang, city.citySlug)} className="hover:opacity-80 transition-opacity flex-shrink-0">
          <CityLogotype size="md" />
        </Link>
        <div className="flex items-center gap-2">
          <NavLinks lang={lang} city={city} />
        </div>
      </div>
    </header>
  );
}
