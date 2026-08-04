import Link from "next/link";
import { CityLogotype } from "@/components/CityLogotype";
import { NavLinks } from "@/components/NavLinks";
import { getLang } from "@/lib/lang";
import { parliamentConfig } from "@/lib/parliament.config";

export async function SiteHeader() {
  const lang = await getLang();
  const langs = Object.keys(parliamentConfig.translations);
  return (
    <header className="w-full border-b border-border bg-surface-0">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
          <CityLogotype size="md" />
        </Link>
        <div className="flex items-center gap-2">
          <NavLinks lang={lang} langs={langs} />
        </div>
      </div>
    </header>
  );
}
