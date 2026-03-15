import Link from "next/link";
import { SnemovnaLogotype } from "@/components/SnemovnaLogotype";

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

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-surface-0 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1 flex flex-col gap-3">
          <SnemovnaLogotype size="sm" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Data: Poslanecká sněmovna ČR
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DataTimes.cz
          </p>
        </div>

        {/* O projektu */}
        <FooterSection title="O projektu">
          <Link href="/o-projektu" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            O projektu
          </Link>
        </FooterSection>

        {/* Naše projekty */}
        <FooterSection title="Naše projekty">
          <FooterLink href="https://datatimes.cz">DataTimes.cz</FooterLink>
          <FooterLink href="https://volebnikalkulacka.cz">Volební kalkulačka</FooterLink>
          <FooterLink href="https://mandaty.cz">Mandáty.cz</FooterLink>
        </FooterSection>

        {/* Kontakt */}
        <FooterSection title="Kontakt">
          <FooterLink href="https://kohovolit.eu">KohoVolit.eu</FooterLink>
        </FooterSection>
      </div>
    </footer>
  );
}
