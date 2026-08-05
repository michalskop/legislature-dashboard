import { getAllMpProfiles, getAllPartyProfiles, getPartyProfile } from "@/lib/data";
import { PageBlockRenderer } from "@/components/PageBlockRenderer";
import { getCityConfig, getCityTranslations, CITIES } from "@/lib/city.config";
import { buildCityMetadata } from "@/lib/metadata";
import { cityBasePath } from "@/lib/routing";
import { PartyFace } from "@/components/PartyFace";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ lang: string; city: string; id: string }>;
}

export async function generateStaticParams({ params }: { params: { lang: string; city: string } }) {
  const { city: citySlug } = params;
  const city = CITIES.find((c) => c.citySlug === citySlug);
  if (!city) return [];
  const parties = await getAllPartyProfiles(citySlug);
  return parties.map((p) => ({ id: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props) {
  const { lang, city: citySlug, id } = await params;
  const city = getCityConfig(citySlug);
  if (!city) return {};
  const data = await getPartyProfile(citySlug, id);
  if (!data) return {};
  return buildCityMetadata({ city, lang, path: `/group/${id}`, title: data.party.name });
}

function pct(v: number | null) {
  if (v === null) return "—";
  return (v * 100).toFixed(1) + " %";
}

export default async function GroupPage({ params }: Props) {
  const { lang, city: citySlug, id } = await params;
  const city = getCityConfig(citySlug);
  if (!city) notFound();

  const [data, allMps, allParties] = await Promise.all([
    getPartyProfile(citySlug, id),
    getAllMpProfiles(citySlug),
    getAllPartyProfiles(citySlug),
  ]);
  if (!data) notFound();

  const { party, members } = data;
  const currentAllMps = allMps.filter((m) => m.isCurrent);
  const memberIds = members.filter((m) => m.isCurrent).map((m) => m.personId);

  const t = getCityTranslations(city, lang);
  const basePath = cityBasePath(lang, citySlug);
  const metricValues = {
    attendance: { value: pct(party.avgAttendance), description: t.metrics.attendance },
    rebelity:   { value: pct(party.avgRebelity),   description: t.metrics.rebelity   },
    govity:     { value: pct(party.avgGovity),     description: t.metrics.govity     },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <PartyFace partyId={party.partyId} size={40} />
        <div>
          <h1 className="text-2xl font-bold">{party.name}</h1>
          <p className="text-sm text-muted-foreground">{t.ui.memberCount.replace("{n}", String(party.memberCount))}</p>
        </div>
      </div>

      <PageBlockRenderer
        blocks={city.pages.groupDetail}
        ctx={{
          lang,
          basePath,
          mps: currentAllMps,
          parties: allParties,
          tableMembers: members,
          highlightIds: memberIds,
          metricValues,
          formerLabel: t.member.former,
          chartLabels: { average: t.charts.average, wpcaXLabel: t.charts.wpca.xLabel, wpcaYLabel: t.charts.wpca.yLabel },
          tableLabels: t.table,
        }}
      />
    </div>
  );
}
