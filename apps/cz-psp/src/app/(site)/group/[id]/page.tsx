import { getAllMpProfiles, getAllPartyProfiles, getPartyProfile } from "@/lib/data";
import { PartyFace } from "@legislature/ui";
import { PageBlockRenderer } from "@/components/PageBlockRenderer";
import { parliamentConfig } from "@/lib/parliament.config";
import { getLang } from "@/lib/lang";
import { buildMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const parties = await getAllPartyProfiles();
  return parties.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const data = await getPartyProfile(id);
  if (!data) return {};
  return buildMetadata(data.party.name);
}

function pct(v: number | null) {
  if (v === null) return "—";
  return (v * 100).toFixed(1) + "\u00a0%";
}

export default async function StranaPage({ params }: Props) {
  const { id } = await params;
  const [data, allMps, allParties] = await Promise.all([
    getPartyProfile(id),
    getAllMpProfiles(),
    getAllPartyProfiles(),
  ]);
  if (!data) notFound();

  const { party, members } = data;
  const currentAllMps = allMps.filter((m) => m.isCurrent);
  const memberIds = members.filter((m) => m.isCurrent).map((m) => m.personId);

  const lang = await getLang();
  const t = parliamentConfig.translations[lang] ?? parliamentConfig.translations[parliamentConfig.defaultLang]!;
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
        blocks={parliamentConfig.pages.groupDetail}
        ctx={{
          lang,
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
