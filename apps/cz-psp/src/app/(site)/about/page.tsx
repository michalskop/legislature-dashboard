import type { Metadata } from "next";
import Link from "next/link";
import { getLang } from "@/lib/lang";
import { aboutContent, type AboutSection } from "@/content/about";

export const metadata: Metadata = {
  title: "O projektu — snemovna.datatimes.cz",
};

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

function Section({ section }: { section: AboutSection }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{section.title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
        {section.paragraphs.map((p, i) => {
          if (p.type === "text") {
            return <p key={i}>{p.text}</p>;
          }
          if (p.type === "list") {
            return (
              <ul key={i} className="list-disc pl-5 space-y-1">
                {p.items.map((item, j) => (
                  <li key={j}>
                    <strong className="text-foreground">{item.label}</strong> — {item.description}
                  </li>
                ))}
              </ul>
            );
          }
          if (p.type === "links") {
            return (
              <ul key={i} className="list-disc pl-5 space-y-1">
                {p.items.map((item, j) => (
                  <li key={j}>
                    <ExternalLink href={item.href}>{item.label}</ExternalLink>
                    {item.description && <> {item.description}</>}
                  </li>
                ))}
              </ul>
            );
          }
          if (p.type === "external-link") {
            const [before, after] = p.suffix
              ? p.suffix.split("{link}")
              : ["", ""];
            return (
              <p key={i}>
                {before}
                <ExternalLink href={p.href}>{p.text}</ExternalLink>
                {after}
              </p>
            );
          }
          return null;
        })}
      </div>
    </section>
  );
}

export default async function OProjektuPage() {
  const lang = await getLang();
  const content = (aboutContent[lang] ?? aboutContent["cs"])!;

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-2">{content.pageTitle}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{content.intro}</p>
      </div>

      {content.sections.map((section, i) => (
        <Section key={i} section={section} />
      ))}

      <div className="pt-4 border-t border-border">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {content.backLabel}
        </Link>
      </div>
    </div>
  );
}
