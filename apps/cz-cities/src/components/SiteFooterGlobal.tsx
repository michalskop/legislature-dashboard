import Link from "next/link";
import { CityLogotype } from "@/components/CityLogotype";
import { getSiteTranslations } from "@/lib/site";
import { globalBasePath } from "@/lib/routing";

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
}

export function SiteFooterGlobal({ lang }: Props) {
  const t = getSiteTranslations(lang);

  return (
    <footer className="w-full border-t border-border bg-surface-0 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1 flex flex-col gap-3">
          <CityLogotype size="sm" />
          <p className="text-xs text-muted-foreground leading-relaxed">{t.footer.dataSource}</p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} DataTimes.cz</p>
        </div>

        <FooterSection title={t.footer.aboutSection}>
          <Link href={`${globalBasePath(lang)}/about`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t.footer.aboutSection}
          </Link>
        </FooterSection>

        <FooterSection title={t.footer.projectsSection}>
          <FooterLink href="https://datatimes.cz">DataTimes.cz</FooterLink>
          <FooterLink href="https://volebnikalkulacka.cz">Volební kalkulačka</FooterLink>
          <FooterLink href="https://mandaty.cz">Mandáty.cz</FooterLink>
        </FooterSection>

        <FooterSection title={t.footer.contactSection}>
          <FooterLink href="https://kohovolit.eu">KohoVolit.eu</FooterLink>
        </FooterSection>
      </div>
    </footer>
  );
}
