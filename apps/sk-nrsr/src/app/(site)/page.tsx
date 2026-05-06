import { getAllMpProfiles, getAllPartyProfiles } from "@/lib/data";
import { PageBlockRenderer } from "@/components/PageBlockRenderer";
import { parliamentConfig } from "@/lib/parliament.config";
import { getLang } from "@/lib/lang";

const siteUrl = "https://nrsr.datatimes.sk";

function DashboardJsonLd({
  currentMpCount,
  groupCount,
}: {
  currentMpCount: number;
  groupCount: number;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "DataTimes",
        url: "https://datatimes.cz",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "NRSR.DataTimes.sk",
        url: siteUrl,
        inLanguage: ["sk", "en"],
        publisher: { "@id": `${siteUrl}/#organization` },
        description:
          "Public dashboard for activity, voting behaviour, attendance, party alignment, and parliamentary groups in the Slovak National Council for the 2023-2027 term.",
      },
      {
        "@type": "Dataset",
        "@id": `${siteUrl}/#dataset`,
        name: "Slovak National Council 2023-2027 dashboard analyses",
        url: siteUrl,
        creator: { "@id": `${siteUrl}/#organization` },
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: ["sk", "en"],
        isAccessibleForFree: true,
        license: "https://nrsr.datatimes.sk/about",
        temporalCoverage: "2023/2027",
        spatialCoverage: {
          "@type": "Country",
          name: "Slovakia",
        },
        variableMeasured: [
          "MP attendance",
          "Rebellious votes",
          "Government alignment",
          "Vote corrections",
          "WPCA voting positions",
        ],
        measurementTechnique: "Derived analysis of public parliamentary voting data",
        description: `Hourly refreshed dashboard data for ${currentMpCount} current MPs and ${groupCount} parliamentary groups in the Slovak National Council.`,
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "text/plain",
            contentUrl: `${siteUrl}/llms.txt`,
          },
          {
            "@type": "DataDownload",
            encodingFormat: "application/xml",
            contentUrl: `${siteUrl}/sitemap.xml`,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function HomePage() {
  const [allMps, parties, lang] = await Promise.all([getAllMpProfiles(), getAllPartyProfiles(), getLang()]);
  const mps = allMps.filter((m) => m.isCurrent);
  const t = parliamentConfig.translations[lang] ?? parliamentConfig.translations[parliamentConfig.defaultLang]!;

  return (
    <div className="space-y-10">
      <DashboardJsonLd currentMpCount={mps.length} groupCount={parties.length} />

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
