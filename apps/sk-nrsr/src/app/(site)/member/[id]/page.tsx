import { getAllMpProfiles, getAllPartyProfiles, getMpProfile } from "@/lib/data";
import { PageBlockRenderer } from "@/components/PageBlockRenderer";
import { parliamentConfig } from "@/lib/parliament.config";
import { getLang } from "@/lib/lang";
import { constituencySlug } from "@/lib/groups";
import { buildMetadata } from "@/lib/metadata";
import { PartyFace } from "@legislature/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const mps = await getAllMpProfiles();
  return mps.map((mp) => ({ id: mp.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const mp = await getMpProfile(id);
  if (!mp) return {};
  return buildMetadata(mp.name);
}

function pct(v: number, decimals = 1) {
  return (v * 100).toFixed(decimals) + "\u00a0%";
}

function fmtDate(iso: string, lang: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(lang, { day: "numeric", month: "numeric", year: "numeric" });
}

export default async function PoslanecPage({ params }: Props) {
  const { id } = await params;
  const [mp, allMps, parties] = await Promise.all([
    getMpProfile(id),
    getAllMpProfiles(),
    getAllPartyProfiles(),
  ]);
  if (!mp) notFound();

  // Charts show current MPs; always include this MP even if former
  const chartMps = allMps.filter((m) => m.isCurrent || m.personId === mp.personId);

  const lang = await getLang();
  const t = parliamentConfig.translations[lang] ?? parliamentConfig.translations[parliamentConfig.defaultLang]!;

  // Labels from org type config
  const groupOrg = parliamentConfig.organizations.find((o) => o.classification === "group");
  const regionOrg = parliamentConfig.organizations.find((o) => o.classification === "constituency");
  const groupLabel = groupOrg?.labels[lang]?.singular ?? "Group";
  const regionLabel = regionOrg?.labels[lang]?.singular ?? "Region";;
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
          {mp.constituency && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="capitalize">{regionLabel}:</span>
              <Link
                href={`/region/${constituencySlug(mp.constituency)}`}
                className="hover:text-primary transition-colors"
              >
                {mp.constituency}
              </Link>
            </p>
          )}
          {mp.partyId && mp.groupName && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="capitalize">{groupLabel}:</span>
              <Link
                href={`/group/${mp.groupId?.split(":").at(-1)}`}
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
        blocks={parliamentConfig.pages.memberDetail}
        ctx={{
          lang,
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
