"use client";

import { SwarmPlot } from "@legislature/charts";
import type { SwarmGroup, SwarmReferenceLine } from "@legislature/charts";
import { SK_NRSR_PARTY_COLORS, SK_NRSR_PARTY_META } from "@legislature/ui";
import type { MpProfile, PartyProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { NrsrLogotype } from "@/components/NrsrLogotype";

interface Props {
  mps: MpProfile[];
  parties: PartyProfile[];
}

/**
 * Sorts parties left→right by average WPCA dim[0] (d1).
 * Falls back to average govity DESC if WPCA not available.
 */
function sortedParties(mps: MpProfile[], parties: PartyProfile[]): PartyProfile[] {
  const wpcaByGroup: Record<string, number> = {};
  for (const party of parties) {
    const partyMps = mps.filter((mp) => mp.groupId === party.groupId && mp.wpca !== null);
    if (partyMps.length > 0) {
      wpcaByGroup[party.groupId] =
        partyMps.reduce((s, mp) => s + (mp.wpca?.x ?? 0), 0) / partyMps.length;
    }
  }

  return [...parties].sort((a, b) => {
    const aW = wpcaByGroup[a.groupId];
    const bW = wpcaByGroup[b.groupId];
    if (aW !== undefined && bW !== undefined) return aW - bW;
    if (aW !== undefined) return -1;
    if (bW !== undefined) return 1;
    return (b.avgGovity ?? 0) - (a.avgGovity ?? 0);
  });
}

export function AttendanceSwarmChart({ mps, parties }: Props) {
  const router = useRouter();

  const orderedParties = sortedParties(mps, parties);

  const groups: SwarmGroup[] = orderedParties.map((party) => {
    const partyMps = mps.filter((mp) => mp.groupId === party.groupId);
    const pid = party.partyId ?? "other";
    const meta = SK_NRSR_PARTY_META[pid];
    const color = SK_NRSR_PARTY_COLORS[pid] ?? "#bcbcb0";
    return {
      id: party.groupId,
      label: party.name,
      iconColor: color,
      iconAbbr: meta?.faceAbbr ?? pid.toUpperCase(),
      iconTextColor: meta?.darkText ? "#1a1a1a" : "#ffffff",
      items: partyMps.map((mp) => ({
        id: mp.personId,
        label: mp.name,
        value: mp.attendance?.present_share ?? 0,
        color,
      })),
    };
  });

  // Parliament average attendance
  const attendanceValues = mps
    .map((mp) => mp.attendance?.present_share)
    .filter((v): v is number => v !== undefined);
  const avg =
    attendanceValues.length > 0
      ? attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length
      : null;

  const referenceLines: SwarmReferenceLine[] = [
    ...(avg !== null
      ? [{ value: avg, label: `Priemer ${(avg * 100).toFixed(0)} %` }]
      : []),
    { value: 0.5, label: "50 %" },
  ];

  return (
    <SwarmPlot
      groups={groups}
      referenceLines={referenceLines}
      yDomain={[0, 1]}
      formatY={(v) => `${(v * 100).toFixed(0)} %`}
      dotSize={10}
      height={360}
      onDotClick={(item) => router.push(`/member/${item.id.split(":").at(-1)}`)}
      watermark={
        <NrsrLogotype size="xs" variant="mono" color="var(--color-surface-8)" />
      }
    />
  );
}
