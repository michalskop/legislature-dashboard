import { getAllMpProfiles, getAllPartyProfiles, getPartyProfile } from "@/lib/data";
import { PartyFace } from "@legislature/ui";
import { MetricCard } from "@/components/MetricCard";
import { SortableMpTable } from "@/components/SortableMpTable";
import { WpcaScatterChart } from "@/components/WpcaScatterChart";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const parties = await getAllPartyProfiles();
  return parties.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getPartyProfile(id);
  if (!data) return {};
  return { title: `${data.party.name} — snemovna.datatimes.cz` };
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <PartyFace partyId={party.partyId} size={40} />
        <div>
          <h1 className="text-2xl font-bold">{party.name}</h1>
          <p className="text-sm text-muted-foreground">{party.memberCount} poslanců</p>
        </div>
      </div>

      {/* Aggregated metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetricCard
          label="Průměrná účast"
          value={pct(party.avgAttendance)}
          description="Průměrná účast členů klubu na hlasování"
        />
        <MetricCard
          label="Průměrná rebelita"
          value={pct(party.avgRebelity)}
          description="Průměrný podíl rebel. hlasování členů klubu"
        />
        <MetricCard
          label="Průměrná vládnost"
          value={pct(party.avgGovity)}
          description="Průměrný podíl hlasování shodných s vládou"
        />
      </div>

      {/* WPCA chart */}
      <section>
        <h2 className="text-lg font-semibold mb-1">Ideologické pozice (WPCA)</h2>
        <p className="text-sm text-muted-foreground mb-3">Členové klubu v kontextu celé sněmovny.</p>
        <WpcaScatterChart mps={currentAllMps} parties={allParties} highlightIds={memberIds} />
      </section>

      {/* Members table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Členové klubu</h2>
        <SortableMpTable mps={members} showPartyFilter={false} />
      </div>
    </div>
  );
}
