import { getAllKrajProfiles, getKrajProfile } from "@/lib/data";
import { PageBlockRenderer } from "@/components/PageBlockRenderer";
import { parliamentConfig } from "@/lib/parliament.config";
import { getLang } from "@/lib/lang";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const kraje = await getAllKrajProfiles();
  return kraje.map((k) => ({ id: k.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getKrajProfile(id);
  if (!data) return {};
  return { title: `${data.kraj.name} — snemovna.datatimes.cz` };
}

function pct(v: number | null) {
  if (v === null) return "—";
  return (v * 100).toFixed(1) + "\u00a0%";
}

export default async function KrajPage({ params }: Props) {
  const { id } = await params;
  const data = await getKrajProfile(id);
  if (!data) notFound();

  const { kraj, members } = data;

  const lang = await getLang();
  const t = parliamentConfig.translations[lang] ?? parliamentConfig.translations[parliamentConfig.defaultLang]!;
  const metricValues = {
    attendance: { value: pct(kraj.avgAttendance), description: t.metrics.attendance },
    rebelity:   { value: pct(kraj.avgRebelity),   description: t.metrics.rebelity   },
    govity:     { value: pct(kraj.avgGovity),     description: t.metrics.govity     },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{kraj.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.ui.memberCount.replace("{n}", String(kraj.memberCount))}</p>
      </div>

      <PageBlockRenderer
        blocks={parliamentConfig.pages.regionDetail ?? []}
        ctx={{
          lang,
          mps: members,
          parties: [],
          tableMembers: members,
          metricValues,
          formerLabel: t.member.former,
          chartLabels: { average: t.charts.average, wpcaXLabel: t.charts.wpca.xLabel, wpcaYLabel: t.charts.wpca.yLabel },
          tableLabels: t.table,
        }}
      />
    </div>
  );
}
