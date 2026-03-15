import { getAllMpProfiles, getAllPartyProfiles, getMpProfile } from "@/lib/data";
import { MetricCard } from "@/components/MetricCard";
import { MpMetricSwarmChart } from "@/components/MpMetricSwarmChart";
import { WpcaScatterChart } from "@/components/WpcaScatterChart";
import { PartyFace } from "@legislature/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const mps = await getAllMpProfiles();
  return mps.map((mp) => ({ id: mp.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const mp = await getMpProfile(id);
  if (!mp) return {};
  return { title: `${mp.name} — snemovna.datatimes.cz` };
}

function pct(v: number, decimals = 1) {
  return (v * 100).toFixed(decimals) + "\u00a0%";
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
          {mp.constituency && (
            <p className="text-sm text-muted-foreground">Kraj: {mp.constituency}</p>
          )}
          {mp.partyId && mp.groupName && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span>Klub:</span>
              <Link
                href={`/strana/${mp.groupId?.split(":").at(-1)}`}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <PartyFace partyId={mp.partyId} size={22} />
                <span className="hover:text-primary transition-colors">{mp.groupName}</span>
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Účast"
          value={mp.attendance ? pct(mp.attendance.present_share) : "—"}
          subValue={mp.attendance ? `${mp.attendance.present} z ${mp.attendance.vote_events_total} hlasování` : undefined}
          description="Podíl hlasování, na kterých byl/a přítomen/přítomna"
        />
        <MetricCard
          label="Rebelita"
          value={mp.rebelity != null ? pct(mp.rebelity.rebelity) : "—"}
          subValue={mp.rebelity ? `${mp.rebelity.rebelity_total} rebel. hlasování` : undefined}
          description="Podíl hlasování proti stanovisku vlastního klubu"
        />
        <MetricCard
          label="Vládnost"
          value={mp.govity != null ? pct(mp.govity.govity) : "—"}
          subValue={mp.govity ? `${mp.govity.govity_total} z ${mp.govity.govity_possible}` : undefined}
          description="Podíl hlasování shodných s vládou"
        />
        <MetricCard
          label="Opravy hlasování"
          value={String(mp.voteCorrections?.corrections_total ?? "—")}
          subValue={mp.voteCorrections ? `${mp.voteCorrections.corrections_announced} oznámených` : undefined}
          description="Celkový počet opravených hlasování (Oops faktor)"
        />
      </div>

      {/* Charts with this MP highlighted */}
      <section>
        <h2 className="text-lg font-semibold mb-1">Účast na hlasování</h2>
        <p className="text-sm text-muted-foreground mb-3">Pozice v rámci sněmovny.</p>
        <MpMetricSwarmChart
          mps={chartMps}
          parties={parties}
          metric="attendance"
          extraReferenceLines={[{ value: 0.5, label: "50\u00a0%" }]}
          highlightId={mp.personId}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">Ideologické pozice (WPCA)</h2>
        <p className="text-sm text-muted-foreground mb-3">Poloha na základě analýzy hlasování.</p>
        <WpcaScatterChart mps={chartMps} parties={parties} highlightId={mp.personId} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">Rebelita</h2>
        <p className="text-sm text-muted-foreground mb-3">Jak často hlasuje proti svému klubu.</p>
        <MpMetricSwarmChart
          mps={chartMps}
          parties={parties}
          metric="rebelity"
          yMode="auto"
          yDecimals={1}
          highlightId={mp.personId}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">Vládnost</h2>
        <p className="text-sm text-muted-foreground mb-3">Jak často hlasuje shodně s vládní koalicí.</p>
        <MpMetricSwarmChart
          mps={chartMps}
          parties={parties}
          metric="govity"
          yMode="auto"
          highlightId={mp.personId}
        />
      </section>
    </div>
  );
}
