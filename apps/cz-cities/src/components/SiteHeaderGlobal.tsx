import Link from "next/link";
import { CityLogotype } from "@/components/CityLogotype";
import { LangSwitcher } from "@/components/LangSwitcher";
import { getSiteTranslations } from "@/lib/site";
import { globalBasePath } from "@/lib/routing";

interface Props {
  lang: string;
}

// Site-wide header for pages that aren't scoped to one city ("/", "/about").
// City pages use SiteHeader (with member/group nav) instead.
export function SiteHeaderGlobal({ lang }: Props) {
  const t = getSiteTranslations(lang);
  return (
    <header className="w-full border-b border-border bg-surface-0">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href={globalBasePath(lang) || "/"} className="hover:opacity-80 transition-opacity flex-shrink-0">
          <CityLogotype size="md" />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`${globalBasePath(lang)}/about`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.aboutNavLabel}
          </Link>
          <LangSwitcher current={lang} />
        </div>
      </div>
    </header>
  );
}
