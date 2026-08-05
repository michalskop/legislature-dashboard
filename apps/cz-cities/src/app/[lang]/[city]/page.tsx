import { notFound } from "next/navigation";
import { getAllMpProfiles, getAllPartyProfiles, isGovernmentAxisOnX } from "@/lib/data";
import { PageBlockRenderer } from "@/components/PageBlockRenderer";
import { getCityConfig, getCityTranslations } from "@/lib/city.config";
import { buildCityMetadata, SITE_URL } from "@/lib/metadata";
import { cityBasePath } from "@/lib/routing";

interface Props {
  params: Promise<{ lang: string; city: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { lang, city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) return {};
  return buildCityMetadata({ city, lang, title: null });
}

function DashboardJsonLd({
  citySlug,
  cityName,
  lang,
  currentMpCount,
  groupCount,
}: {
  citySlug: string;
  cityName: string;
  lang: string;
  currentMpCount: number;
  groupCount: number;
}) {
  const pageUrl = `${SITE_URL}${cityBasePath(lang, citySlug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "DataTimes",
        url: "https://datatimes.cz",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Města.DataTimes.cz",
        url: SITE_URL,
        inLanguage: ["cs", "en"],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Dataset",
        "@id": `${pageUrl}/#dataset`,
        name: `${cityName} — roll-call vote analyses`,
        url: pageUrl,
        creator: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["cs", "en"],
        isAccessibleForFree: true,
        license: `${SITE_URL}/about`,
        temporalCoverage: "2022/2026",
        spatialCoverage: { "@type": "City", name: cityName },
        variableMeasured: [
          "Assembly member attendance",
          "Rebellious votes",
          "Coalition alignment",
          "WPCA voting positions",
        ],
        measurementTechnique: "Derived analysis of public roll-call voting data published by the city",
        description: `Roll-call vote analyses for ${currentMpCount} current assembly members across ${groupCount} groups.`,
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

export default async function CityHomePage({ params }: Props) {
  const { lang, city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) notFound();

  const [allMps, parties, govAxisOnX] = await Promise.all([
    getAllMpProfiles(citySlug),
    getAllPartyProfiles(citySlug),
    isGovernmentAxisOnX(citySlug),
  ]);
  // Owner review fix (2026-08-05, DIVERGENCE.md §8): the front-page charts
  // must plot everyone present in the analysis outputs (attendance/rebelity/
  // govity/wpca already correctly include members who left mid-term, e.g.
  // STAN's David Procházka, departed 2025-03-27), not a separately-filtered
  // "current members" subset — `isCurrent` undercounts who *appears* in the
  // metric at all. `currentMps` is kept only for the JSON-LD dataset
  // description below, a legitimate, different use of "current" (how many
  // sit today), unrelated to the chart-population bug.
  const currentMps = allMps.filter((m) => m.isCurrent);
  const t = getCityTranslations(city, lang);
  const basePath = cityBasePath(lang, citySlug);

  return (
    <div className="space-y-10">
      <DashboardJsonLd
        citySlug={citySlug}
        cityName={city.name}
        lang={lang}
        currentMpCount={currentMps.length}
        groupCount={parties.length}
      />

      <section>
        <h1 className="text-3xl font-bold mb-2">{t.home.title}</h1>
        <p className="text-muted-foreground text-lg">{t.home.description}</p>
      </section>

      <PageBlockRenderer
        blocks={city.pages.home}
        ctx={{
          lang,
          mps: allMps,
          parties,
          // WPCA scatter axes are fixed (x=dims[0], y=dims[1] — lib/data.ts),
          // but WHICH axis is actually the government/opposition axis is
          // detected per government_axis.json (owner reversal, 2026-08-05,
          // DIVERGENCE.md §8 (a)) — so the "Koalice | Opozice" label text
          // goes wherever that axis renders, not always on x.
          chartLabels: {
            average: t.charts.average,
            wpcaXLabel: govAxisOnX ? t.charts.wpca.xLabel : t.charts.wpca.yLabel,
            wpcaYLabel: govAxisOnX ? t.charts.wpca.yLabel : t.charts.wpca.xLabel,
          },
          tableLabels: t.table,
          basePath,
        }}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href={`${basePath}/members`} className="block p-6 bg-surface-2 rounded-badge hover:bg-surface-3 transition-colors">
          <h2 className="text-xl font-semibold mb-1">{t.home.membersCardTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.home.membersCardDescription}</p>
        </a>
        <a href={`${basePath}/groups`} className="block p-6 bg-surface-2 rounded-badge hover:bg-surface-3 transition-colors">
          <h2 className="text-xl font-semibold mb-1">{t.home.groupsCardTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.home.groupsCardDescription}</p>
        </a>
      </section>
    </div>
  );
}
