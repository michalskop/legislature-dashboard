import { getAllPartyProfiles } from "@/lib/data";
import { PartyFace } from "@legislature/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strany — snemovna.datatimes.cz",
};

function pct(v: number | null) {
  if (v === null) return "—";
  return (v * 100).toFixed(1) + "\u00a0%";
}

export default async function StranyPage() {
  const parties = await getAllPartyProfiles();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Poslanecké kluby</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {parties.map((party) => (
          <Link
            key={party.groupId}
            href={`/strana/${party.slug}`}
            className="bg-surface-2 rounded-badge p-5 hover:bg-surface-3 transition-colors flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PartyFace partyId={party.partyId} size={32} />
                <span className="font-semibold text-lg">{party.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{party.memberCount} poslanců</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Účast</div>
                <div className="font-semibold tabular-nums">{pct(party.avgAttendance)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Rebelita</div>
                <div className="font-semibold tabular-nums">{pct(party.avgRebelity)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Vládnost</div>
                <div className="font-semibold tabular-nums">{pct(party.avgGovity)}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
