import { getAllMpProfiles, getAllPartyProfiles, getPartyProfile, isGovernmentAxisOnX } from "@/lib/data";
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

  const [data, allMps, allParties, govAxisOnX] = await Promise.all([
    getPartyProfile(citySlug, id),
    getAllMpProfiles(citySlug),
    getAllPartyProfiles(citySlug),
    isGovernmentAxisOnX(citySlug),
  ]);
  if (!data) notFound();

  const { party, members } = data;
  // Owner review fix (2026-08-05, DIVERGENCE.md §8 (d)): charts must include
  // every member who held a seat during the term, not just currently-sitting
  // members — same root cause/fix as §6 item 8's front-page undercounting
  // bug, never propagated here until now. Do NOT confuse this with
  // groups/page.tsx's currentParties/formerParties headcount split, which is
  // intentionally current-only (a different, legitimate question — "how many
  // members does this group have right now" — left untouched).
  const chartMps = allMps;
  const memberIds = members.map((m) => m.personId);

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
          mps: chartMps,
          parties: allParties,
          tableMembers: members,
          highlightIds: memberIds,
          metricValues,
          formerLabel: t.member.former,
          // See page.tsx's identical construction / lib/data.ts's
          // isGovernmentAxisOnX doc comment.
          chartLabels: {
            average: t.charts.average,
            wpcaXLabel: govAxisOnX ? t.charts.wpca.xLabel : t.charts.wpca.yLabel,
            wpcaYLabel: govAxisOnX ? t.charts.wpca.yLabel : t.charts.wpca.xLabel,
          },
          tableLabels: t.table,
        }}
      />
    </div>
  );
}
