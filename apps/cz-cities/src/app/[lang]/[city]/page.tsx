import { notFound } from "next/navigation";
import { getAllMpProfiles, getAllPartyProfiles } from "@/lib/data";
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
        name: "Mesta.DataTimes.cz",
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
          "Councillor attendance",
          "Rebellious votes",
          "Coalition alignment",
          "WPCA voting positions",
        ],
        measurementTechnique: "Derived analysis of public roll-call voting data published by the city",
        description: `Roll-call vote analyses for ${currentMpCount} current councillors across ${groupCount} groups.`,
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

  const [allMps, parties] = await Promise.all([getAllMpProfiles(citySlug), getAllPartyProfiles(citySlug)]);
  const mps = allMps.filter((m) => m.isCurrent);
  const t = getCityTranslations(city, lang);
  const basePath = cityBasePath(lang, citySlug);

  return (
    <div className="space-y-10">
      <DashboardJsonLd
        citySlug={citySlug}
        cityName={city.name}
        lang={lang}
        currentMpCount={mps.length}
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
          mps,
          parties,
          chartLabels: { average: t.charts.average, wpcaXLabel: t.charts.wpca.xLabel, wpcaYLabel: t.charts.wpca.yLabel },
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
