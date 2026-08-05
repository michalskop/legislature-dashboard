"use client";

import { SwarmPlot } from "@legislature/charts";
import type { SwarmGroup, SwarmReferenceLine } from "@legislature/charts";
import { PARTY_COLORS, PARTY_META } from "@/lib/parties";
import { ensureChartContrast } from "@legislature/utils";
import type { MpProfile, PartyProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { CityLogotype } from "@/components/CityLogotype";

export type MpMetric = "attendance" | "rebelity" | "govity";

interface Props {
  mps: MpProfile[];
  parties: PartyProfile[];
  metric: MpMetric;
  /**
   * "full" — fixed 0–100% axis (default).
   * "auto" — compute a nice upper bound from the data values.
   */
  yMode?: "full" | "auto";
  /** Decimal places for y-axis labels (×100 %). Default 0. */
  yDecimals?: number;
  extraReferenceLines?: SwarmReferenceLine[];
  height?: number;
  /** Highlight a single MP by personId */
  highlightId?: string;
  /** Label for the party-average reference line. Defaults to "Průměr". */
  averageLabel?: string;
  /** City base path, e.g. "/praha" or "/en/praha" — used to build member links. */
  basePath: string;
}

function getValue(mp: MpProfile, metric: MpMetric): number | null {
  if (metric === "attendance") return mp.attendance?.present_share ?? null;
  if (metric === "rebelity") return mp.rebelity?.rebelity ?? null;
  if (metric === "govity") return mp.govity?.govity ?? null;
  return null;
}

// Owner review fix (2026-08-05, DIVERGENCE.md §3): party/group columns are
// ordered by each party's mean WPCA dim1 value (`mp.wpca.x`, which is
// `dims[0]` from praha/analyses/wpca/outputs/wpca.json — see lib/data.ts's
// getAllMpProfiles), DESCENDING — higher mean dim1 (coalition side, per the
// wpca_definition.json rotation anchored on the mayor, see DIVERGENCE.md's
// item-4 writeup) sorts first/leftmost. Parties with no WPCA-included
// members sort after those that do; among those, fall back to avgGovity
// (higher coalition-alignment first) so the order is still deterministic.
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
    if (aW !== undefined && bW !== undefined) return bW - aW;
    if (aW !== undefined) return -1;
    if (bW !== undefined) return 1;
    return (b.avgGovity ?? 0) - (a.avgGovity ?? 0);
  });
}

const makeFormatY = (decimals: number) => (v: number) =>
  `${(v * 100).toFixed(decimals)}\u00a0%`;

/** Round up to a nice boundary with at most ~5–10 ticks */
function niceUpperBound(max: number): number {
  const padded = max * 1.15;
  const steps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0];
  const step = steps.find((s) => padded <= s * 10) ?? 1.0;
  return Math.ceil(padded / step) * step;
}

export function MpMetricSwarmChart({
  mps,
  parties,
  metric,
  yMode = "full",
  yDecimals = 0,
  extraReferenceLines = [],
  height = 360,
  highlightId,
  averageLabel = "Průměr",
  basePath,
}: Props) {
  const formatY = makeFormatY(yDecimals);
  const router = useRouter();
  const orderedParties = sortedParties(mps, parties);

  const groups: SwarmGroup[] = orderedParties.map((party) => {
    const partyMps = mps.filter((mp) => mp.groupId === party.groupId);
    const pid = party.partyId ?? "other";
    const meta = PARTY_META[pid];
    const color = PARTY_COLORS[pid] ?? "#bcbcb0";
    const dotColor = ensureChartContrast(color);
    return {
      id: party.groupId,
      label: party.name,
      iconColor: color,
      iconAbbr: meta?.faceAbbr ?? pid.toUpperCase(),
      iconTextColor: meta?.darkText ? "#1a1a1a" : "#ffffff",
      items: partyMps
        .map((mp) => {
          const value = getValue(mp, metric);
          if (value === null) return null;
          return { id: mp.personId, label: mp.name, value, color: dotColor };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    };
  });

  const allValues = mps.map((mp) => getValue(mp, metric)).filter((v): v is number => v !== null);
  const avg = allValues.length > 0
    ? allValues.reduce((a, b) => a + b, 0) / allValues.length
    : null;

  const yDomain: [number, number] = yMode === "auto" && allValues.length > 0
    ? [0, niceUpperBound(Math.max(...allValues))]
    : [0, 1];

  const referenceLines: SwarmReferenceLine[] = [
    ...(avg !== null ? [{ value: avg, label: `${averageLabel} ${formatY(avg)}` }] : []),
    ...extraReferenceLines,
  ];

  return (
    <SwarmPlot
      groups={groups}
      referenceLines={referenceLines}
      yDomain={yDomain}
      formatY={formatY}
      dotSize={10}
      height={height}
      highlightId={highlightId}
      onDotClick={(item) => router.push(`${basePath}/member/${item.id.split(":").at(-1)}`)}
      watermark={
        <CityLogotype size="xs" variant="mono" color="var(--color-surface-8)" />
      }
    />
  );
}
