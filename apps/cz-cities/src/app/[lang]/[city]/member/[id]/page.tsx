import { getAllMpProfiles, getAllPartyProfiles, getMpProfile } from "@/lib/data";
import { PageBlockRenderer } from "@/components/PageBlockRenderer";
import { getCityConfig, getCityTranslations, CITIES } from "@/lib/city.config";
import { buildCityMetadata } from "@/lib/metadata";
import { cityBasePath } from "@/lib/routing";
import { PartyFace } from "@/components/PartyFace";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

interface Props {
  params: Promise<{ lang: string; city: string; id: string }>;
}

export async function generateStaticParams({ params }: { params: { lang: string; city: string } }) {
  const { city: citySlug } = params;
  const city = CITIES.find((c) => c.citySlug === citySlug);
  if (!city) return [];
  const mps = await getAllMpProfiles(citySlug);
  return mps.map((mp) => ({ id: mp.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props) {
  const { lang, city: citySlug, id } = await params;
  const city = getCityConfig(citySlug);
  if (!city) return {};
  const mp = await getMpProfile(citySlug, id);
  if (!mp) return {};
  return buildCityMetadata({ city, lang, path: `/member/${id}`, title: mp.name });
}

function pct(v: number, decimals = 1) {
  return (v * 100).toFixed(decimals) + " %";
}

function fmtDate(iso: string, lang: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(lang, { day: "numeric", month: "numeric", year: "numeric" });
}

export default async function MemberPage({ params }: Props) {
  const { lang, city: citySlug, id } = await params;
  const city = getCityConfig(citySlug);
  if (!city) notFound();

  const [mp, allMps, parties] = await Promise.all([
    getMpProfile(citySlug, id),
    getAllMpProfiles(citySlug),
    getAllPartyProfiles(citySlug),
  ]);
  if (!mp) notFound();

  // Charts show current MPs; always include this MP even if former
  const chartMps = allMps.filter((m) => m.isCurrent || m.personId === mp.personId);

  const t = getCityTranslations(city, lang);
  const basePath = cityBasePath(lang, citySlug);

  // Labels from org type config
  const groupOrg = city.organizations.find((o) => o.classification === "group");
  const groupLabel = groupOrg?.labels[lang]?.singular ?? "Group";
  const metricValues = {
    attendance: mp.attendance ? {
      value: pct(mp.attendance.present_share),
      sub: `${mp.attendance.present} ${t.ui.outOf} ${mp.attendance.vote_events_total}`,
      description: t.metrics.attendance,
    } : undefined,
    rebelity: mp.rebelity ? {
      value: pct(mp.rebelity.rebelity, 1),
      sub: t.ui.rebelVotes.replace("{n}", String(mp.rebelity.rebelity_total)),
      description: t.metrics.rebelity,
    } : undefined,
    govity: mp.govity ? {
      value: pct(mp.govity.govity),
      sub: `${mp.govity.govity_total} ${t.ui.outOf} ${mp.govity.govity_possible}`,
      description: t.metrics.govity,
    } : undefined,
    corrections: mp.voteCorrections ? {
      value: String(mp.voteCorrections.corrections_total),
      sub: t.ui.announcedCorrections.replace("{n}", String(mp.voteCorrections.corrections_announced)),
      description: t.metrics.corrections,
    } : undefined,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        {mp.image && (
          <Image
            src={mp.image}
            alt={mp.name}
            width={80}
            height={100}
            className="rounded-badge object-cover flex-shrink-0"
          />
        )}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{mp.name}</h1>
          {!mp.isCurrent && (
            <p className="text-sm font-medium text-muted-foreground">
              <span className="inline-block bg-surface-2 rounded px-2 py-0.5">
                {t.member.former}
                {mp.mandateSince && (
                  <> · {fmtDate(mp.mandateSince, lang)}{mp.mandateUntil ? ` – ${fmtDate(mp.mandateUntil, lang)}` : ""}</>
                )}
              </span>
            </p>
          )}
          {mp.partyId && mp.groupName && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="capitalize">{groupLabel}:</span>
              <Link
                href={`${basePath}/group/${mp.groupId?.split(":").at(-1)}`}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <PartyFace partyId={mp.partyId} size={22} />
                <span className="hover:text-primary transition-colors">{mp.groupName}</span>
              </Link>
            </p>
          )}
        </div>
      </div>

      <PageBlockRenderer
        blocks={city.pages.memberDetail}
        ctx={{
          lang,
          basePath,
          mps: chartMps,
          parties,
          highlightId: mp.personId,
          metricValues,
          chartLabels: { average: t.charts.average, wpcaXLabel: t.charts.wpca.xLabel, wpcaYLabel: t.charts.wpca.yLabel },
          tableLabels: t.table,
        }}
      />
    </div>
  );
}
