import { getAllMpProfiles, getAllPartyProfiles } from "@/lib/data";
import { PageBlockRenderer } from "@/components/PageBlockRenderer";
import { parliamentConfig } from "@/lib/parliament.config";
import { getLang } from "@/lib/lang";

export default async function HomePage() {
  const [allMps, parties, lang] = await Promise.all([getAllMpProfiles(), getAllPartyProfiles(), getLang()]);
  const mps = allMps.filter((m) => m.isCurrent);
  const t = parliamentConfig.translations[lang] ?? parliamentConfig.translations[parliamentConfig.defaultLang]!;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-bold mb-2">{t.home.title}</h1>
        <p className="text-muted-foreground text-lg">{t.home.description}</p>
      </section>

      <PageBlockRenderer
        blocks={parliamentConfig.pages.home}
        ctx={{ lang, mps, parties, chartLabels: { average: t.charts.average, wpcaXLabel: t.charts.wpca.xLabel, wpcaYLabel: t.charts.wpca.yLabel }, tableLabels: t.table }}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/members" className="block p-6 bg-surface-2 rounded-badge hover:bg-surface-3 transition-colors">
          <h2 className="text-xl font-semibold mb-1">{t.home.membersCardTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.home.membersCardDescription}</p>
        </a>
        <a href="/groups" className="block p-6 bg-surface-2 rounded-badge hover:bg-surface-3 transition-colors">
          <h2 className="text-xl font-semibold mb-1">{t.home.groupsCardTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.home.groupsCardDescription}</p>
        </a>
      </section>
    </div>
  );
}
