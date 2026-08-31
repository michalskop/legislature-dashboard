import Link from "next/link";
import { CityLogotype } from "@/components/CityLogotype";
import type { CityConfig } from "@/lib/city.config";
import { getCityTranslations } from "@/lib/city.config";
import { getSiteTranslations } from "@/lib/site";
import { globalBasePath } from "@/lib/routing";
import { fetchRunStatus } from "@/lib/data";

function fmtDate(iso: string | null | undefined, lang: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(lang === "en" ? "en-GB" : "cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "Europe/Prague",
  });
}

function fmtDateTime(iso: string | null | undefined, lang: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(lang === "en" ? "en-GB" : "cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Prague",
  });
}

function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </a>
  );
}

interface Props {
  lang: string;
  city: CityConfig;
}

export async function SiteFooter({ lang, city }: Props) {
  const t = getCityTranslations(city, lang);
  const site = getSiteTranslations(lang);

  const status = await fetchRunStatus(city.citySlug);
  const dataAsOf = fmtDate(status?.last_data_change_utc, lang);
  const lastChecked = fmtDateTime(status?.last_successful_run_utc, lang);
  const freshnessLine = [
    dataAsOf && site.footer.dataAsOf.replace("{date}", dataAsOf),
    lastChecked && site.footer.lastChecked.replace("{datetime}", lastChecked),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="w-full border-t border-border bg-surface-0 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1 flex flex-col gap-3">
          <CityLogotype size="sm" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.footer.dataSource}
          </p>
          {freshnessLine && (
            <p className="text-xs text-muted-foreground">{freshnessLine}</p>
          )}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DataTimes.cz
          </p>
        </div>

        <FooterSection title={site.footer.aboutSection}>
          <Link href={`${globalBasePath(lang)}/about`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {site.footer.aboutSection}
          </Link>
        </FooterSection>

        <FooterSection title={site.footer.projectsSection}>
          <FooterLink href="https://datatimes.cz">DataTimes.cz</FooterLink>
          <FooterLink href="https://volebnikalkulacka.cz">Volební kalkulačka</FooterLink>
          <FooterLink href="https://mandaty.cz">Mandáty.cz</FooterLink>
        </FooterSection>

        <FooterSection title={site.footer.contactSection}>
          <FooterLink href="https://kohovolit.eu">KohoVolit.eu</FooterLink>
        </FooterSection>
      </div>
    </footer>
  );
}
