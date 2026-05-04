"use client";

import { ScatterPlot } from "@legislature/charts";
import type { ScatterGroup } from "@legislature/charts";
import { CZ_PSP_PARTY_COLORS, CZ_PSP_PARTY_META } from "@legislature/ui";
import { ensureChartContrast } from "@legislature/utils";
import type { MpProfile, PartyProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { SnemovnaLogotype } from "@/components/SnemovnaLogotype";

interface Props {
  mps: MpProfile[];
  parties: PartyProfile[];
  height?: number;
  highlightId?: string;
  highlightIds?: string[];
  xLabel?: string;
  yLabel?: string;
}

export function WpcaScatterChart({ mps, parties, height = 400, highlightId, highlightIds, xLabel = "◄ ◄ ◄ Vládní koalice\u2009|\u2009Opozice ► ► ►", yLabel = "Rozdíly v rámci koalice nebo opozice" }: Props) {
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
    const meta = CZ_PSP_PARTY_META[pid];
    const color = CZ_PSP_PARTY_COLORS[pid] ?? "#bcbcb0";
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
      onDotClick={(item) => router.push(`/member/${item.id.split(":").at(-1)}`)}
      watermark={
        <SnemovnaLogotype size="xs" variant="mono" color="var(--color-surface-8)" />
      }
    />
  );
}
