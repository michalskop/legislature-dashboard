"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";

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
  requirement?: string;
  required_count?: number;
  polarity_counts: VoteEventPolarityCounts;
  groups: VoteEventPartyGroup[];
  dotSize?: number;
  resultLabels?: { pass: string; fail: string; other?: string };
  polarityLabels?: { support: string; oppose: string; neutral: string };
  /**
   * "party-first"    — group by party, dots colored by polarity (default)
   * "polarity-first" — group by polarity, party-colored dots per row
   * "wp"             — three columns For|Against|Not voting, dense party-face grid
   * "tabule"         — dark board replicating physical chamber display, per-party row counts
   */
  layout?: "party-first" | "polarity-first" | "wp" | "tabule";
  requirementCountLabel?: string;
  logo?: React.ReactNode;
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
  showAbbr = true,
}: {
  voter: VoteEventVoter;
  group: VoteEventPartyGroup;
  size: number;
  showAbbr?: boolean;
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
        {showAbbr && (
          <text x="15" y="18" fontFamily="'Roboto Slab', serif" fontSize={fontSize} fontWeight="700"
            fill={group.iconTextColor} textAnchor="middle">
            {group.iconAbbr}
          </text>
        )}
      </svg>
      <Tooltip pos={pos} label={label} size={size} />
    </div>
  );
}

// ─── Shared header ────────────────────────────────────────────────────────────

function VoteEventHeader({
  title, date, result, requirement, required_count, polarity_counts, resultLabels, polarityLabels, requirementCountLabel,
}: Pick<VoteEventGridProps, "title" | "date" | "result" | "requirement" | "required_count" | "polarity_counts" | "resultLabels" | "polarityLabels" | "requirementCountLabel">) {
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
      {(requirement || required_count !== undefined) && (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
          {requirement && <span>{requirement}</span>}
          {required_count !== undefined && (
            <>
              <span>{requirementCountLabel ?? "required"}</span>
              <span className="font-semibold">{required_count}</span>
            </>
          )}
        </div>
      )}
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

// ─── Support column with shape-following dashed outline at required_count ─────

function SupportColumnWithThreshold({
  voters,
  groupByVoter,
  dotSize,
  required_count,
}: {
  voters: VoteEventVoter[];
  groupByVoter: Map<string, VoteEventPartyGroup>;
  dotSize: number;
  required_count: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [outlinePath, setOutlinePath] = useState("");

  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const dotEls = Array.from(container.querySelectorAll<HTMLElement>("[data-t]"));
    if (dotEls.length === 0) return;

    const cRect = container.getBoundingClientRect();
    const pad = 3;

    type Row = { top: number; bottom: number; left: number; right: number };
    const rows: Row[] = [];
    for (const el of dotEls) {
      const r = el.getBoundingClientRect();
      const top = r.top - cRect.top;
      const bottom = r.bottom - cRect.top;
      const left = r.left - cRect.left;
      const right = r.right - cRect.left;
      const last = rows[rows.length - 1];
      if (last && Math.abs(top - last.top) < 4) {
        last.right = Math.max(last.right, right);
        last.bottom = Math.max(last.bottom, bottom);
      } else {
        rows.push({ top, bottom, left, right });
      }
    }

    if (rows.length === 0) return;

    const R = rows.map(r => ({
      top: r.top - pad, bottom: r.bottom + pad,
      left: r.left - pad, right: r.right + pad,
    }));

    const first = R[0]!;
    const last = R[R.length - 1]!;
    const pts: string[] = [`M ${first.left} ${first.top}`, `L ${first.right} ${first.top}`];
    for (let i = 0; i < R.length - 1; i++) {
      const cur = R[i]!;
      const next = R[i + 1]!;
      pts.push(`L ${cur.right} ${cur.bottom}`, `L ${next.right} ${cur.bottom}`);
    }
    pts.push(`L ${last.right} ${last.bottom}`);
    pts.push(`L ${last.left} ${last.bottom}`);
    for (let i = R.length - 1; i > 0; i--) {
      const cur = R[i]!;
      const prev = R[i - 1]!;
      pts.push(`L ${cur.left} ${cur.top}`, `L ${prev.left} ${cur.top}`);
    }
    pts.push("Z");
    setOutlinePath(pts.join(" "));
  }, [required_count]);

  useLayoutEffect(() => { recompute(); }, [recompute, voters.length, dotSize]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [recompute]);

  const inside = voters.slice(0, required_count);
  const overflow = voters.slice(required_count);
  const placeholderCount = Math.max(0, required_count - inside.length);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {outlinePath && (
        <svg
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ width: "100%", height: "100%", overflow: "visible", zIndex: 0 }}
        >
          <path d={outlinePath} fill="rgba(0,0,0,0.07)" stroke="none" />
        </svg>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${dotSize}px)`, gap: 4, position: "relative", zIndex: 1 }}>
        {inside.map((v) => {
          const g = groupByVoter.get(v.voter_id);
          return g ? (
            <div key={v.voter_id} data-t="" style={{ lineHeight: 0 }}>
              <PartyFaceDot voter={v} group={g} size={dotSize} showAbbr={false} />
            </div>
          ) : null;
        })}
        {Array.from({ length: placeholderCount }, (_, i) => (
          <div key={`ph-${i}`} data-t="" style={{ width: dotSize, height: dotSize }} />
        ))}
        {overflow.map((v) => {
          const g = groupByVoter.get(v.voter_id);
          return g ? (
            <div key={v.voter_id} style={{ lineHeight: 0 }}>
              <PartyFaceDot voter={v} group={g} size={dotSize} showAbbr={false} />
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

// ─── WP layout (Washington Post-inspired) ────────────────────────────────────
// Three columns side-by-side (md+): For | Against | Not voting
// Dense flat grid of party-face dots (no abbr text) + legend below.
// Voters ordered: biggest party first, consistent within section.

function WpLegend({ groups }: { groups: VoteEventPartyGroup[] }) {
  const present = groups.filter((g) => g.voters.length > 0);

  // Per-group polarity counts
  const pol = new Map<string, Record<string, number>>();
  for (const g of present) {
    const key = g.group_id ?? g.party_id;
    const c: Record<string, number> = { support: 0, oppose: 0, neutral: 0 };
    for (const v of g.voters) c[v.polarity] = (c[v.polarity] ?? 0) + 1;
    pol.set(key, c);
  }

  function dominant(g: VoteEventPartyGroup): "support" | "oppose" | "neutral" {
    const c = pol.get(g.group_id ?? g.party_id) ?? {};
    const s = c.support ?? 0, o = c.oppose ?? 0, n = c.neutral ?? 0;
    if (s >= o && s >= n) return "support";
    if (o >= n) return "oppose";
    return "neutral";
  }

  const buckets: Record<"support" | "oppose" | "neutral", VoteEventPartyGroup[]> = { support: [], oppose: [], neutral: [] };
  for (const g of present) buckets[dominant(g)].push(g);

  const sortBucket = (arr: VoteEventPartyGroup[], p: string) =>
    arr.slice().sort((a, b) =>
      (pol.get(b.group_id ?? b.party_id)?.[p] ?? 0) -
      (pol.get(a.group_id ?? a.party_id)?.[p] ?? 0)
    );

  const ordered = [
    ...sortBucket(buckets.support, "support"),
    ...sortBucket(buckets.oppose, "oppose"),
    ...sortBucket(buckets.neutral, "neutral"),
  ];

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
      {ordered.map((g) => (
        <div key={g.group_id ?? g.party_id} className="flex items-center gap-1">
          <svg width={12} height={12} viewBox="0 0 30 30" style={{ display: "block", flexShrink: 0 }}>
            <path d={FACE_PATH} fill={g.iconColor} />
          </svg>
          <span className="text-xs text-muted-foreground">{g.label}</span>
        </div>
      ))}
    </div>
  );
}

function WpLayout({
  groups,
  dotSize,
  polarityLabels,
  required_count,
}: {
  groups: VoteEventPartyGroup[];
  dotSize: number;
  polarityLabels: { support: string; oppose: string; neutral: string };
  required_count?: number;
}) {
  const groupByVoter = new Map<string, VoteEventPartyGroup>();
  for (const g of groups) {
    for (const v of g.voters) groupByVoter.set(v.voter_id, g);
  }

  const all = groups.flatMap((g) => g.voters);
  const byPolarity = new Map<string, VoteEventVoter[]>([["support", []], ["oppose", []], ["neutral", []]]);
  for (const v of all) byPolarity.get(v.polarity)?.push(v);

  function sortedVoters(voters: VoteEventVoter[]): VoteEventVoter[] {
    const counts = new Map<string, number>();
    for (const v of voters) {
      const g = groupByVoter.get(v.voter_id);
      const key = g ? (g.group_id ?? g.party_id) : "__unknown__";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return voters.slice().sort((a, b) => {
      const ga = groupByVoter.get(a.voter_id);
      const gb = groupByVoter.get(b.voter_id);
      const ka = ga ? (ga.group_id ?? ga.party_id) : "__unknown__";
      const kb = gb ? (gb.group_id ?? gb.party_id) : "__unknown__";
      if (ka !== kb) return (counts.get(kb) ?? 0) - (counts.get(ka) ?? 0);
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }

  const neutralDotSize = Math.max(10, dotSize - 4);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {POLARITY_ORDER.map((p) => {
          const voters = byPolarity.get(p) ?? [];
          const isNeutral = p === "neutral";
          const sectionColor = POLARITY_COLORS[p];
          const label = polarityLabels[p];
          const ds = isNeutral ? neutralDotSize : dotSize;
          const sorted = sortedVoters(voters);

          return (
            <div key={p} className={isNeutral ? "opacity-60" : ""}>
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="rounded px-2 py-0.5 text-xs font-semibold text-white"
                  style={{ background: sectionColor }}
                >
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">{voters.length}</span>
              </div>
              {p === "support" && required_count !== undefined ? (
                <SupportColumnWithThreshold
                  voters={sorted}
                  groupByVoter={groupByVoter}
                  dotSize={ds}
                  required_count={required_count}
                />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${ds}px)`, gap: 4 }}>
                  {sorted.map((v) => {
                    const g = groupByVoter.get(v.voter_id);
                    return g ? <PartyFaceDot key={v.voter_id} voter={v} group={g} size={ds} showAbbr={false} /> : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <WpLegend groups={groups} />
    </div>
  );
}

// ─── Tabule layout (physical chamber board) ──────────────────────────────────
// Dark board replicating CZ Sněmovna physical display.
// Two columns of parties; columns: present (👤) | ✓ | ✗ only.
// Q in header = quorum (required_count), not neutral.

function PersonSvg({ color }: { color: string }) {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }} aria-hidden>
      <circle cx="12" cy="7" r="4" fill={color} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill={color} />
    </svg>
  );
}

function TabulePartyRow({ g }: { g: VoteEventPartyGroup }) {
  const c = { support: 0, oppose: 0, neutral: 0 };
  for (const v of g.voters) c[v.polarity]++;
  const voted = c.support + c.oppose;
  const cell = (icon: React.ReactNode, n: number, numColor: string, dimColor: string) => (
    <span style={{ width: 54, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, flexShrink: 0 }}>
      {icon}
      <span style={{ fontWeight: 700, color: n > 0 ? numColor : dimColor, fontSize: 15, fontFamily: "monospace" }}>{n}</span>
    </span>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "3px 4px", borderBottom: "1px solid #1e293b" }}>
      <span style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: g.iconColor, flexShrink: 0, marginRight: 6 }} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "sans-serif" }}>
        {g.label}
      </span>
      {cell(<PersonSvg color={voted > 0 ? "#64748b" : "#1e293b"} />, voted, "#94a3b8", "#334155")}
      {cell(<span style={{ fontSize: 12, color: c.support > 0 ? "#4ade80" : "#1e3a2a" }}>✓</span>, c.support, "#4ade80", "#1e3a2a")}
      {cell(<span style={{ fontSize: 12, color: c.oppose > 0 ? "#f87171" : "#3a1e1e" }}>✗</span>, c.oppose, "#f87171", "#3a1e1e")}
    </div>
  );
}

function TabuleLayout({
  groups,
  polarity_counts,
  polarityLabels,
  result,
  resultLabels,
  title,
  date,
  requirement,
  required_count,
  requirementCountLabel,
  logo,
}: {
  groups: VoteEventPartyGroup[];
  polarity_counts: VoteEventPolarityCounts;
  polarityLabels: { support: string; oppose: string; neutral: string };
  result: string | null;
  resultLabels: { pass: string; fail: string; other?: string };
  title: string;
  date: string;
  requirement?: string;
  required_count?: number;
  requirementCountLabel?: string;
  logo?: React.ReactNode;
}) {
  const present = groups.filter((g) => g.voters.length > 0);
  const half = Math.ceil(present.length / 2);
  const cols = [present.slice(0, half), present.slice(half)];

  const resultLabel =
    result === "pass" ? resultLabels.pass :
    result === "fail" ? resultLabels.fail :
    resultLabels.other ?? result ?? "";
  const resultColor = result === "pass" ? "#4ade80" : result === "fail" ? "#f87171" : "#94a3b8";
  const voted = polarity_counts.support + polarity_counts.oppose;

  return (
    <div style={{ background: "#0c1220", borderRadius: 8, padding: "10px 14px", color: "#f9fafb" }}>
      {/* Title + date + logo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 1, fontFamily: "sans-serif" }}>{date}</div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, fontFamily: "sans-serif", color: "#cbd5e1" }}>{title}</div>
        </div>
        {logo && <div style={{ opacity: 0.45, marginLeft: 10, flexShrink: 0 }}>{logo}</div>}
      </div>

      {/* Summary bar: RESULT | 👤 voted | Q quorum | ✓ | ✗ */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 14px", padding: "6px 0", borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b", marginBottom: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: resultColor, fontFamily: "sans-serif", letterSpacing: 1, marginRight: 4 }}>
          {resultLabel}
        </span>
        <span style={{ fontSize: 13, fontFamily: "monospace", display: "inline-flex", alignItems: "center", gap: 3 }}>
          <PersonSvg color="#64748b" /><strong style={{ color: "#94a3b8" }}>{voted}</strong>
        </span>
        {required_count !== undefined && (
          <span style={{ fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>
            Q <strong style={{ color: "#cbd5e1" }}>{required_count}</strong>
          </span>
        )}
        <span style={{ fontSize: 15, fontWeight: 800, color: "#4ade80", fontFamily: "monospace" }}>
          ✓ {polarity_counts.support}
        </span>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#f87171", fontFamily: "monospace" }}>
          ✗ {polarity_counts.oppose}
        </span>
      </div>

      {/* Two-column party table */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        {cols.map((col, ci) => (
          <div key={ci}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "1px 4px 4px", fontSize: 11, fontFamily: "sans-serif" }}>
              <span style={{ flex: 1 }} />
              <span style={{ width: 54, textAlign: "center", display: "inline-block", color: "#4b5563" }}><PersonSvg color="#4b5563" /></span>
              <span style={{ width: 54, textAlign: "center", display: "inline-block", color: "#4ade80" }}>✓</span>
              <span style={{ width: 54, textAlign: "center", display: "inline-block", color: "#f87171" }}>✗</span>
            </div>
            {col.map((g) => <TabulePartyRow key={g.group_id ?? g.party_id} g={g} />)}
          </div>
        ))}
      </div>

      {requirement && (
        <div style={{ fontSize: 11, color: "#475569", marginTop: 6, fontFamily: "sans-serif" }}>{requirement}</div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VoteEventGrid({
  title,
  date,
  result,
  requirement,
  required_count,
  polarity_counts,
  groups,
  dotSize = 16,
  resultLabels = { pass: "Passed", fail: "Failed" },
  polarityLabels = { support: "support", oppose: "oppose", neutral: "neutral" },
  layout = "party-first",
  requirementCountLabel,
  logo,
}: VoteEventGridProps) {
  if (layout === "tabule") {
    return (
      <TabuleLayout
        groups={groups}
        polarity_counts={polarity_counts}
        polarityLabels={polarityLabels}
        result={result}
        resultLabels={resultLabels}
        title={title}
        date={date}
        requirement={requirement}
        required_count={required_count}
        requirementCountLabel={requirementCountLabel}
        logo={logo}
      />
    );
  }

  return (
    <div className="bg-surface-2 rounded-badge-xl border border-border flex flex-col gap-3 p-4 overflow-hidden">
      {/* Card header: logo + metadata */}
      <div className="flex items-start justify-between gap-2">
        <VoteEventHeader
          title={title}
          date={date}
          result={result}
          requirement={requirement}
          required_count={required_count}
          polarity_counts={polarity_counts}
          resultLabels={resultLabels}
          polarityLabels={polarityLabels}
          requirementCountLabel={requirementCountLabel}
        />
        {logo && <div className="shrink-0">{logo}</div>}
      </div>
      {layout === "polarity-first" ? (
        <PolarityFirstLayout groups={groups} dotSize={dotSize} polarityLabels={polarityLabels} />
      ) : layout === "wp" ? (
        <WpLayout groups={groups} dotSize={dotSize} polarityLabels={polarityLabels} required_count={required_count} />
      ) : (
        <PartyFirstLayout groups={groups} dotSize={dotSize} />
      )}
    </div>
  );
}
