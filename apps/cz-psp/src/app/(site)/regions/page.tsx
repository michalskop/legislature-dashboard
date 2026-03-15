import { getAllKrajProfiles } from "@/lib/data";
import { parliamentConfig } from "@/lib/parliament.config";
import { buildMetadata } from "@/lib/metadata";
import Link from "next/link";

const regionOrg0 = parliamentConfig.organizations.find((o) => o.classification === "constituency");
export const metadata = buildMetadata(
  regionOrg0?.labels[parliamentConfig.defaultLang]?.listTitle ?? "Kraje"
);

function pct(v: number | null) {
  if (v === null) return "—";
  return (v * 100).toFixed(1) + "\u00a0%";
}

export default async function KrajePage() {
  const kraje = await getAllKrajProfiles();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kraje</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kraje.map((kraj) => (
          <Link
            key={kraj.slug}
            href={`/region/${kraj.slug}`}
            className="bg-surface-2 rounded-badge p-5 hover:bg-surface-3 transition-colors flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">{kraj.name}</span>
              <span className="text-sm text-muted-foreground">{kraj.memberCount} poslanců</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Účast</div>
                <div className="font-semibold tabular-nums">{pct(kraj.avgAttendance)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Rebelita</div>
                <div className="font-semibold tabular-nums">{pct(kraj.avgRebelity)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Vládnost</div>
                <div className="font-semibold tabular-nums">{pct(kraj.avgGovity)}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
