"use client";

import { useState } from "react";

const FACE_PATH =
  "M 11.29 0 Q 0 0 0 11.29 L 0 18.71 Q 0 30 11.29 30 L 18.71 30 Q 30 30 30 18.71 L 30 0 L 11.29 0 Z";

const OPTION_COLORS: Record<string, string> = {
  yes:        "#22c55e",
  no:         "#ef4444",
  abstain:    "#f59e0b",
  "not voting": "#94a3b8",
  absent:     "#e2e8f0",
};

const OPTION_ORDER = ["yes", "no", "abstain", "not voting", "absent"];

// ─── Public types ─────────────────────────────────────────────────────────────

export interface VoteEventVoter {
  voter_id: string;
  name: string;
  option: string;
  group_id: string | null;
  party_id: string;
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

export interface VoteEventCounts {
  yes: number;
  no: number;
  abstain: number;
  not_voting: number;
  absent: number;
}

export interface VoteEventGridProps {
  title: string;
  date: string;
  result: string;
  counts: VoteEventCounts;
  groups: VoteEventPartyGroup[];
  dotSize?: number;
  resultLabels?: { pass: string; fail: string; other: string };
  optionLabels?: Partial<Record<string, string>>;
}

// ─── Voter dot ────────────────────────────────────────────────────────────────

function VoterDot({
  voter,
  size,
}: {
  voter: VoteEventVoter;
  size: number;
}) {
  const [hovered, setHovered] = useState(false);
  const opt = voter.option.toLowerCase();
  const color = OPTION_COLORS[opt] ?? "#d1d5db";

  return (
    <div style={{ position: "relative", display: "inline-block", lineHeight: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        style={{ display: "block", cursor: "default" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`${voter.name}: ${voter.option}`}
      >
        <path d={FACE_PATH} fill={color} />
      </svg>
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "110%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1a1a1a",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: "nowrap",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {voter.name}
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
  counts,
  groups,
  dotSize = 16,
  resultLabels = { pass: "Passed", fail: "Failed", other: result },
  optionLabels = {},
}: VoteEventGridProps) {
  const resultColor =
    result === "pass" ? "#22c55e" : result === "fail" ? "#ef4444" : "#94a3b8";
  const resultLabel =
    result === "pass"
      ? resultLabels.pass
      : result === "fail"
        ? resultLabels.fail
        : resultLabels.other ?? result;

  const iconFontSize = 9 * Math.pow(20 / 42, 0.25);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="shrink-0 rounded px-2 py-0.5 text-xs font-semibold text-white"
            style={{ background: resultColor }}
          >
            {resultLabel}
          </span>
          <span className="text-sm text-muted-foreground">{date}</span>
        </div>
        <h1 className="text-lg font-semibold leading-snug">{title}</h1>
      </div>

      {/* Counts legend */}
      <div className="flex flex-wrap gap-3 text-sm">
        {OPTION_ORDER.map((opt) => {
          const key = opt.replace(" ", "_") as keyof VoteEventCounts;
          const n = counts[key] ?? 0;
          if (n === 0) return null;
          const color = OPTION_COLORS[opt] ?? "#d1d5db";
          const label = optionLabels[opt] ?? opt;
          return (
            <span key={opt} className="flex items-center gap-1">
              <svg width={12} height={12} viewBox="0 0 30 30" style={{ display: "block", flexShrink: 0 }}>
                <path d={FACE_PATH} fill={color} />
              </svg>
              <span className="font-semibold">{n}</span>
              <span className="text-muted-foreground">{label}</span>
            </span>
          );
        })}
      </div>

      {/* Party groups */}
      <div className="space-y-5">
        {groups.map((group) => {
          const sorted = group.voters
            .slice()
            .sort((a, b) => {
              const ai = OPTION_ORDER.indexOf(a.option.toLowerCase());
              const bi = OPTION_ORDER.indexOf(b.option.toLowerCase());
              return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
            });

          return (
            <div key={group.group_id ?? group.party_id} className="space-y-1.5">
              {/* Party label row */}
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
              {/* Voter dots */}
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
