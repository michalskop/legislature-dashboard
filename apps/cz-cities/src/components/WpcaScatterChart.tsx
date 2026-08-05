"use client";

import { ScatterPlot } from "@legislature/charts";
import type { ScatterGroup } from "@legislature/charts";
import { PARTY_COLORS, PARTY_META } from "@/lib/parties";
import { ensureChartContrast } from "@legislature/utils";
import type { MpProfile, PartyProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { CityLogotype } from "@/components/CityLogotype";

interface Props {
  mps: MpProfile[];
  parties: PartyProfile[];
  height?: number;
  highlightId?: string;
  highlightIds?: string[];
  xLabel?: string;
  yLabel?: string;
  /** City base path, e.g. "/praha" or "/en/praha" — used to build member links. */
  basePath: string;
}

// x = the detected government/opposition axis (mp.wpca.x — see lib/data.ts's
// getAllMpProfiles/pickWpcaAxes, which reads government_axis.json to decide
// which wpca.json dims[] index this is; not hardcoded here). y = whatever
// dimension is left over, which has no established political meaning, so its
// default label stays neutral rather than claiming one — see DIVERGENCE.md §7.
export function WpcaScatterChart({ mps, parties, height = 400, highlightId, highlightIds, xLabel = "◄ ◄ ◄ Koalice\u2009|\u2009Opozice ► ► ►", yLabel = "Jiná dimenze hlasování", basePath }: Props) {
  const router = useRouter();

  // Sort parties by avg WPCA x (left→right) for a consistent legend order
  const orderedParties = [...parties].sort((a, b) => {
    const ax = mps.filter((m) => m.groupId === a.groupId && m.wpca).map((m) => m.wpca!.x);
    const bx = mps.filter((m) => m.groupId === b.groupId && m.wpca).map((m) => m.wpca!.x);
    const avgA = ax.length ? ax.reduce((s, v) => s + v, 0) / ax.length : 0;
    const avgB = bx.length ? bx.reduce((s, v) => s + v, 0) / bx.length : 0;
    return avgA - avgB;
  });

  const groups: ScatterGroup[] = orderedParties.map((party) => {
    const pid = party.partyId ?? "other";
    const meta = PARTY_META[pid];
    const color = PARTY_COLORS[pid] ?? "#bcbcb0";
    const dotColor = ensureChartContrast(color);
    const partyMps = mps.filter((mp) => mp.groupId === party.groupId && mp.wpca?.included);
    return {
      id: party.groupId,
      label: meta?.shortName ?? party.name,
      color,
      abbr: meta?.faceAbbr ?? pid.toUpperCase(),
      textColor: meta?.darkText ? "#1a1a1a" : "#ffffff",
      items: partyMps.map((mp) => ({
        id: mp.personId,
        label: mp.name,
        x: mp.wpca!.x,
        y: mp.wpca!.y,
        color: dotColor,
      })),
    };
  }).filter((g) => g.items.length > 0);

  return (
    <ScatterPlot
      groups={groups}
      dotSize={10}
      height={height}
      xLabel={xLabel}
      yLabel={yLabel}
      formatX={(v) => v.toFixed(2)}
      formatY={(v) => v.toFixed(2)}
      highlightId={highlightId}
      highlightIds={highlightIds}
      onDotClick={(item) => router.push(`${basePath}/member/${item.id.split(":").at(-1)}`)}
      watermark={
        <CityLogotype size="xs" variant="mono" color="var(--color-surface-8)" />
      }
    />
  );
}
