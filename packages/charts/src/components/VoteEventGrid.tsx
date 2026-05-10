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
}

// ─── Voter dot ────────────────────────────────────────────────────────────────

function VoterDot({ voter, size }: { voter: VoteEventVoter; size: number }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const color = POLARITY_COLORS[voter.polarity] ?? "#d1d5db";
  const label = voter.name ? `${voter.name} (${voter.option})` : voter.option;

  const handleMove = useCallback((e: React.MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div style={{ display: "inline-block", lineHeight: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        style={{ display: "block", cursor: "default" }}
        onMouseEnter={handleMove}
        onMouseMove={handleMove}
        onMouseLeave={() => setPos(null)}
        aria-label={label}
      >
        <title>{label}</title>
        <path d={FACE_PATH} fill={color} />
      </svg>
      {pos && (
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
      )}
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
}: VoteEventGridProps) {
  const resultColor =
    result === "pass" ? "#22c55e" : result === "fail" ? "#ef4444" : "#94a3b8";
  const resultLabel =
    result === "pass"
      ? resultLabels.pass
      : result === "fail"
        ? resultLabels.fail
        : resultLabels.other ?? result ?? "";

  const iconFontSize = 9 * Math.pow(20 / 42, 0.25);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {resultLabel && (
            <span
              className="shrink-0 rounded px-2 py-0.5 text-xs font-semibold text-white"
              style={{ background: resultColor }}
            >
              {resultLabel}
            </span>
          )}
          <span className="text-sm text-muted-foreground">{date}</span>
        </div>
        <h1 className="text-lg font-semibold leading-snug">{title}</h1>
      </div>

      {/* Polarity counts legend */}
      <div className="flex flex-wrap gap-3 text-sm">
        {POLARITY_ORDER.map((p) => {
          const n = polarity_counts[p];
          if (n === 0) return null;
          return (
            <span key={p} className="flex items-center gap-1">
              <svg width={12} height={12} viewBox="0 0 30 30" style={{ display: "block", flexShrink: 0 }}>
                <path d={FACE_PATH} fill={POLARITY_COLORS[p]} />
              </svg>
              <span className="font-semibold">{n}</span>
              <span className="text-muted-foreground">{polarityLabels[p]}</span>
            </span>
          );
        })}
      </div>

      {/* Party groups */}
      <div className="space-y-5">
        {groups.map((group) => {
          const sorted = group.voters
            .slice()
            .sort((a, b) => POLARITY_ORDER.indexOf(a.polarity) - POLARITY_ORDER.indexOf(b.polarity));

          return (
            <div key={group.group_id ?? group.party_id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 30 30"
                  style={{ display: "block", flexShrink: 0 }}
                  aria-label={group.label}
                >
                  <path d={FACE_PATH} fill={group.iconColor} />
                  <text
                    x="15"
                    y="18"
                    fontFamily="'Roboto Slab', serif"
                    fontSize={iconFontSize}
                    fontWeight="700"
                    fill={group.iconTextColor}
                    textAnchor="middle"
                  >
                    {group.iconAbbr}
                  </text>
                </svg>
                <span className="text-sm font-medium">{group.label}</span>
                <span className="text-xs text-muted-foreground">({sorted.length})</span>
              </div>
              <div className="flex flex-wrap gap-0.5 pl-6">
                {sorted.map((voter) => (
                  <VoterDot key={voter.voter_id} voter={voter} size={dotSize} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
