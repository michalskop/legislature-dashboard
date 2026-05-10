"use client";

import { useState, useCallback } from "react";

const FACE_PATH =
  "M 11.29 0 Q 0 0 0 11.29 L 0 18.71 Q 0 30 11.29 30 L 18.71 30 Q 30 30 30 18.71 L 30 0 L 11.29 0 Z";

const POLARITY_COLORS: Record<string, string> = {
  support: "#22c55e",
  oppose:  "#ef4444",
  neutral: "#cbd5e1",
};

const POLARITY_ORDER = ["support", "oppose", "neutral"] as const;

// ─── Public types ─────────────────────────────────────────────────────────────

export interface VoteEventVoter {
  voter_id: string;
  option: string;
  polarity: "support" | "oppose" | "neutral";
  name?: string;
  group_id?: string | null;
}

export interface VoteEventPartyGroup {
  group_id: string | null;
  party_id: string;
  label: string;
  iconColor: string;
  iconAbbr: string;
  iconTextColor: string;
  voters: VoteEventVoter[];
}

export interface VoteEventPolarityCounts {
  support: number;
  oppose:  number;
  neutral: number;
  total:   number;
}

export interface VoteEventGridProps {
  title: string;
  date: string;
  result: string | null;
  polarity_counts: VoteEventPolarityCounts;
  groups: VoteEventPartyGroup[];
  dotSize?: number;
  resultLabels?: { pass: string; fail: string; other?: string };
  polarityLabels?: { support: string; oppose: string; neutral: string };
  /**
   * "party-first"   — group by party, dots colored by polarity (default)
   * "polarity-first" — group by polarity, party-colored dots, neutral below
   */
  layout?: "party-first" | "polarity-first";
}

// ─── Shared tooltip ───────────────────────────────────────────────────────────

function Tooltip({ pos, label, size }: { pos: { x: number; y: number } | null; label: string; size: number }) {
  if (!pos) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y - size - 10,
        transform: "translateX(-50%)",
        background: "#1a1a1a",
        color: "#fff",
        padding: "3px 8px",
        borderRadius: 4,
        fontSize: 12,
        lineHeight: "normal",
        whiteSpace: "nowrap",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {label}
    </div>
  );
}

// ─── Polarity-colored dot (party-first layout) ────────────────────────────────

function PolarityDot({ voter, size }: { voter: VoteEventVoter; size: number }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const color = POLARITY_COLORS[voter.polarity] ?? "#d1d5db";
  const label = voter.name ? `${voter.name} (${voter.option})` : voter.option;
  const handleMove = useCallback((e: React.MouseEvent) => setPos({ x: e.clientX, y: e.clientY }), []);

  return (
    <div style={{ display: "inline-block", lineHeight: 0 }}>
      <svg width={size} height={size} viewBox="0 0 30 30" style={{ display: "block", cursor: "default" }}
        onMouseEnter={handleMove} onMouseMove={handleMove} onMouseLeave={() => setPos(null)}
        aria-label={label}>
        <title>{label}</title>
        <path d={FACE_PATH} fill={color} />
      </svg>
      <Tooltip pos={pos} label={label} size={size} />
    </div>
  );
}

// ─── Party-colored face dot (polarity-first layout) ───────────────────────────

function PartyFaceDot({
  voter,
  group,
  size,
}: {
  voter: VoteEventVoter;
  group: VoteEventPartyGroup;
  size: number;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const label = voter.name ? `${voter.name} (${voter.option})` : voter.option;
  const fontSize = 9 * Math.pow(size / 42, 0.25);
  const handleMove = useCallback((e: React.MouseEvent) => setPos({ x: e.clientX, y: e.clientY }), []);

  return (
    <div style={{ display: "inline-block", lineHeight: 0 }}>
      <svg width={size} height={size} viewBox="0 0 30 30" style={{ display: "block", cursor: "default" }}
        onMouseEnter={handleMove} onMouseMove={handleMove} onMouseLeave={() => setPos(null)}
        aria-label={label}>
        <title>{label}</title>
        <path d={FACE_PATH} fill={group.iconColor} />
        <text x="15" y="18" fontFamily="'Roboto Slab', serif" fontSize={fontSize} fontWeight="700"
          fill={group.iconTextColor} textAnchor="middle">
          {group.iconAbbr}
        </text>
      </svg>
      <Tooltip pos={pos} label={label} size={size} />
    </div>
  );
}

// ─── Shared header ────────────────────────────────────────────────────────────

function VoteEventHeader({
  title, date, result, polarity_counts, resultLabels, polarityLabels,
}: Pick<VoteEventGridProps, "title" | "date" | "result" | "polarity_counts" | "resultLabels" | "polarityLabels">) {
  const resultColor = result === "pass" ? "#22c55e" : result === "fail" ? "#ef4444" : "#94a3b8";
  const resultLabel = result === "pass" ? resultLabels?.pass ?? "Pass"
    : result === "fail" ? resultLabels?.fail ?? "Fail"
    : resultLabels?.other ?? result ?? "";
  const pl = polarityLabels ?? { support: "support", oppose: "oppose", neutral: "neutral" };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        {resultLabel && (
          <span className="shrink-0 rounded px-2 py-0.5 text-xs font-semibold text-white" style={{ background: resultColor }}>
            {resultLabel}
          </span>
        )}
        <span className="text-sm text-muted-foreground">{date}</span>
        <span className="flex flex-wrap gap-3 text-sm ml-2">
          {POLARITY_ORDER.map((p) => {
            const n = polarity_counts[p];
            if (n === 0) return null;
            return (
              <span key={p} className="flex items-center gap-1">
                <svg width={10} height={10} viewBox="0 0 30 30" style={{ display: "block", flexShrink: 0 }}>
                  <path d={FACE_PATH} fill={POLARITY_COLORS[p]} />
                </svg>
                <span className="font-semibold">{n}</span>
                <span className="text-muted-foreground">{pl[p]}</span>
              </span>
            );
          })}
        </span>
      </div>
      <h1 className="text-lg font-semibold leading-snug">{title}</h1>
    </div>
  );
}

// ─── Party-first layout ───────────────────────────────────────────────────────

function PartyFirstLayout({ groups, dotSize }: { groups: VoteEventPartyGroup[]; dotSize: number }) {
  const iconFontSize = 9 * Math.pow(20 / 42, 0.25);
  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const sorted = group.voters.slice()
          .sort((a, b) => POLARITY_ORDER.indexOf(a.polarity) - POLARITY_ORDER.indexOf(b.polarity));
        return (
          <div key={group.group_id ?? group.party_id} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <svg width={20} height={20} viewBox="0 0 30 30" style={{ display: "block", flexShrink: 0 }} aria-label={group.label}>
                <path d={FACE_PATH} fill={group.iconColor} />
                <text x="15" y="18" fontFamily="'Roboto Slab', serif" fontSize={iconFontSize}
                  fontWeight="700" fill={group.iconTextColor} textAnchor="middle">
                  {group.iconAbbr}
                </text>
              </svg>
              <span className="text-sm font-medium">{group.label}</span>
              <span className="text-xs text-muted-foreground">({sorted.length})</span>
            </div>
            <div className="flex flex-wrap gap-0.5 pl-6">
              {sorted.map((voter) => <PolarityDot key={voter.voter_id} voter={voter} size={dotSize} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Polarity-first layout ────────────────────────────────────────────────────

function PolarityFirstLayout({
  groups,
  dotSize,
  polarityLabels,
}: {
  groups: VoteEventPartyGroup[];
  dotSize: number;
  polarityLabels: { support: string; oppose: string; neutral: string };
}) {
  // Build voter→group lookup for party-face rendering
  const groupByVoter = new Map<string, VoteEventPartyGroup>();
  for (const g of groups) {
    for (const v of g.voters) groupByVoter.set(v.voter_id, g);
  }

  // All voters flat, split by polarity
  const all = groups.flatMap((g) => g.voters);
  const byPolarity = new Map<string, VoteEventVoter[]>([["support", []], ["oppose", []], ["neutral", []]]);
  for (const v of all) byPolarity.get(v.polarity)?.push(v);

  return (
    <div className="space-y-6">
      {POLARITY_ORDER.map((p) => {
        const voters = byPolarity.get(p) ?? [];
        if (voters.length === 0) return null;
        const isNeutral = p === "neutral";
        const sectionColor = POLARITY_COLORS[p];
        const label = polarityLabels[p];

        // Sub-group by party, preserving group order
        const seenGroups: VoteEventPartyGroup[] = [];
        const votersByGroup = new Map<string, VoteEventVoter[]>();
        for (const v of voters) {
          const g = groupByVoter.get(v.voter_id);
          if (!g) continue;
          const key = g.group_id ?? g.party_id;
          if (!votersByGroup.has(key)) {
            seenGroups.push(g);
            votersByGroup.set(key, []);
          }
          votersByGroup.get(key)!.push(v);
        }

        seenGroups.sort((a, b) => {
          const ak = a.group_id ?? a.party_id;
          const bk = b.group_id ?? b.party_id;
          return (votersByGroup.get(bk)?.length ?? 0) - (votersByGroup.get(ak)?.length ?? 0);
        });

        const iconFontSize = 9 * Math.pow(14 / 42, 0.25);
        const faceDotSize = isNeutral ? Math.max(10, dotSize - 4) : dotSize;

        return (
          <div key={p} className={isNeutral ? "opacity-70" : ""}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="rounded px-2 py-0.5 text-xs font-semibold text-white"
                style={{ background: sectionColor }}
              >
                {label}
              </span>
              <span className="text-xs text-muted-foreground">{voters.length}</span>
            </div>
            {/* Party sub-rows */}
            <div className="space-y-2">
              {seenGroups.map((g) => {
                const key = g.group_id ?? g.party_id;
                const gVoters = votersByGroup.get(key) ?? [];
                return (
                  <div key={key} className="flex items-start gap-2">
                    {/* Party label */}
                    <div className="flex items-center gap-1 shrink-0 w-24">
                      <svg width={14} height={14} viewBox="0 0 30 30" style={{ display: "block", flexShrink: 0 }}>
                        <path d={FACE_PATH} fill={g.iconColor} />
                        <text x="15" y="18" fontFamily="'Roboto Slab', serif" fontSize={iconFontSize}
                          fontWeight="700" fill={g.iconTextColor} textAnchor="middle">
                          {g.iconAbbr}
                        </text>
                      </svg>
                      <span className="text-xs text-muted-foreground truncate">{g.iconAbbr}</span>
                    </div>
                    {/* Party-colored voter faces */}
                    <div className="flex flex-wrap gap-0.5">
                      {gVoters.map((v) => (
                        <PartyFaceDot key={v.voter_id} voter={v} group={g} size={faceDotSize} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VoteEventGrid({
  title,
  date,
  result,
  polarity_counts,
  groups,
  dotSize = 16,
  resultLabels = { pass: "Passed", fail: "Failed" },
  polarityLabels = { support: "support", oppose: "oppose", neutral: "neutral" },
  layout = "party-first",
}: VoteEventGridProps) {
  return (
    <div className="space-y-5">
      <VoteEventHeader
        title={title}
        date={date}
        result={result}
        polarity_counts={polarity_counts}
        resultLabels={resultLabels}
        polarityLabels={polarityLabels}
      />
      {layout === "polarity-first" ? (
        <PolarityFirstLayout groups={groups} dotSize={dotSize} polarityLabels={polarityLabels} />
      ) : (
        <PartyFirstLayout groups={groups} dotSize={dotSize} />
      )}
    </div>
  );
}
