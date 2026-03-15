import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O projektu — snemovna.datatimes.cz",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
    >
      {children}
    </a>
  );
}

export default function OProjektuPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-2">O projektu</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          snemovna.datatimes.cz je otevřený přehled aktivity poslanců a stran
          v Poslanecké sněmovně Parlamentu České republiky.
        </p>
      </div>

      <Section title="Co zobrazujeme">
        <p>
          Pro každého poslance a každou poslankyni zobrazujeme čtyři základní metriky
          vypočítané z hlasování ve sněmovně:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-foreground">Účast na hlasování</strong> — podíl hlasování, na nichž
            byl/a poslanec/poslankyně přítomen/přítomna.
          </li>
          <li>
            <strong className="text-foreground">Rebelita</strong> — jak často hlasuje
            proti stanovisku vlastního poslaneckého klubu.
          </li>
          <li>
            <strong className="text-foreground">Vládnost</strong> — jak často hlasuje
            shodně s vládní koalicí.
          </li>
          <li>
            <strong className="text-foreground">Opravy hlasování</strong> — počet
            dodatečně opravených (tzv. „oops") hlasování.
          </li>
        </ul>
        <p>
          Dále zobrazujeme ideologické pozice poslanců metodou WPCA (vážená analýza
          hlavních komponent), která odhaluje, kdo v sněmovně hlasuje podobně.
        </p>
      </Section>

      <Section title="Data">
        <p>
          Data o hlasování pocházejí z{" "}
          <ExternalLink href="https://www.psp.cz/sqw/hp.sqw?k=1300">
            otevřených dat Poslanecké sněmovny ČR
          </ExternalLink>
        </p>
        <p>
          Stránka se automaticky aktualizuje každý den.
        </p>
      </Section>

      {/* <Section title="Metodika">
        TODO: Add methodology details
      </Section> */}

      <Section title="Autoři">
        <p>
          Projekt je součástí rodiny projektů{" "}
          <ExternalLink href="https://datatimes.cz">DataTimes.cz</ExternalLink>{" "}
          s podporou <ExternalLink href="https://kohovolit.eu">KohoVolit.eu</ExternalLink>.
        </p>
      </Section>

      <Section title="Podobné projekty">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <ExternalLink href="https://mandaty.cz">Mandáty.cz</ExternalLink>
            {" "}— Agregace volebních průzkumů
          </li>
          <li>
            <ExternalLink href="https://volebnikalkulacka.cz">Volební kalkulačka</ExternalLink>
            {" "}— porovnejte svůj postoj s postoji stran a kandidátů
          </li>
        </ul>
      </Section>

      <div className="pt-4 border-t border-border">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Zpět na přehled
        </Link>
      </div>
    </div>
  );
}
