import { getAllKrajProfiles, getKrajProfile } from "@/lib/data";
import { MetricCard } from "@/components/MetricCard";
import { SortableMpTable } from "@/components/SortableMpTable";
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{kraj.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{kraj.memberCount} poslanců</p>
      </div>

      {/* Aggregated metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetricCard
          label="Průměrná účast"
          value={pct(kraj.avgAttendance)}
          description="Průměrná účast poslanců z tohoto kraje na hlasování"
        />
        <MetricCard
          label="Průměrná rebelita"
          value={pct(kraj.avgRebelity)}
          description="Průměrný podíl rebel. hlasování poslanců z kraje"
        />
        <MetricCard
          label="Průměrná vládnost"
          value={pct(kraj.avgGovity)}
          description="Průměrný podíl hlasování shodných s vládou"
        />
      </div>

      {/* Members table — party filter shown since members are from mixed parties */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Poslanci z kraje</h2>
        <SortableMpTable mps={members} />
      </div>
    </div>
  );
}
