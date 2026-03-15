"use client";

import { scaleBand, scaleLinear } from "@visx/scale";
import { Group } from "@visx/group";
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { useParentSize } from "@visx/responsive";
import type { MouseEvent, ReactNode } from "react";

// ─── Public types ────────────────────────────────────────────────────────────

export interface SwarmDatum {
  id: string;
  label: string;
  value: number;   // must be within yDomain
  color: string;   // CSS color string or hex
}

export interface SwarmGroup {
  id: string;
  label: string;
  items: SwarmDatum[];
  /** If set, renders a party-face SVG on the x-axis instead of a text label */
  iconColor?: string;
  iconAbbr?: string;
  /** Text color inside the face — auto-contrasted if omitted */
  iconTextColor?: string;
}

export interface SwarmReferenceLine {
  value: number;
  label?: string;
}

export interface SwarmPlotProps {
  groups: SwarmGroup[];
  referenceLines?: SwarmReferenceLine[];
  /** Y axis domain, default [0, 1] */
  yDomain?: [number, number];
  /** Format a Y value for display, default "X %" (×100) */
  formatY?: (v: number) => string;
  /** Dot size (width = height) in px, default 10 */
  dotSize?: number;
  /** Chart height in px, default 320 */
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  /** Called when a dot is clicked */
  onDotClick?: (item: SwarmDatum, group: SwarmGroup) => void;
  /** Optional branding element rendered bottom-right */
  watermark?: ReactNode;
  /** Highlight a single dot by id — all others are dimmed */
  highlightId?: string;
}

// ─── Dot / face shape ────────────────────────────────────────────────────────

// Square with 3 rounded corners (top-right is sharp) — same as PartyFace in pollster-2026
// ViewBox: 30×30; scale to target size
const FACE_PATH =
  "M 11.29 0 Q 0 0 0 11.29 L 0 18.71 Q 0 30 11.29 30 L 18.71 30 Q 30 30 30 18.71 L 30 0 L 11.29 0 Z";

const ICON_SIZE = 32; // px — x-axis party face size
const ICON_SCALE = ICON_SIZE / 30;
// Font size formula mirroring PartyFaceBase: 9 * (size/42)^0.25
const ICON_FONT_SIZE = 9 * Math.pow(ICON_SIZE / 42, 0.25);

function autoTextColor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#1a1a1a" : "#ffffff";
}

// ─── Beeswarm placement ───────────────────────────────────────────────────────

interface Placed {
  item: SwarmDatum;
  dx: number; // horizontal offset from group centre
}

/**
 * Greedy beeswarm — places dots within ±maxDx of the group centre.
 * Dots only overlap if no non-overlapping position fits inside the bin.
 * When forced to overlap, dots still cycle through horizontal positions so
 * they spread across the bin rather than piling at the centre.
 */
function placeBeeswarm(
  items: SwarmDatum[],
  getY: (v: number) => number,
  size: number,
  maxDx: number,
): Placed[] {
  const gap = 1.5;
  const step = size + gap; // minimum centre-to-centre separation
  const placed: Array<{ y: number; dx: number }> = [];
  const result: Placed[] = new Array(items.length);

  // Sort by value so dots are placed from bottom to top
  const sorted = items
    .map((item, origIdx) => ({ item, origIdx }))
    .sort((a, b) => a.item.value - b.item.value);

  for (const { item, origIdx } of sorted) {
    const y = getY(item.value);

    // Build candidate offsets within bin: 0, ±step, ±2·step, …
    const candidates: number[] = [0];
    for (let s = 1; s * step <= maxDx + step * 0.5; s++) {
      const pos = s * step;
      const neg = -s * step;
      if (pos <= maxDx) candidates.push(pos);
      if (neg >= -maxDx) candidates.push(neg);
    }

    // Find first collision-free position; if none, cycle through bin positions anyway
    // so forced-overlap dots are spread horizontally rather than piled at centre
    let dx = candidates[placed.length % candidates.length] ?? 0;
    for (const candidate of candidates) {
      const ok = placed.every((p) => {
        const dy = p.y - y;
        const ddx = p.dx - candidate;
        return Math.hypot(ddx, dy) >= step;
      });
      if (ok) {
        dx = candidate;
        break;
      }
    }

    placed.push({ y, dx });
    result[origIdx] = { item, dx };
  }

  return result;
}

// ─── Inner (fixed-width) chart ────────────────────────────────────────────────

interface TooltipData {
  item: SwarmDatum;
  group: SwarmGroup;
}

interface InnerProps extends SwarmPlotProps {
  width: number;
}

const DEFAULT_MARGIN = { top: 16, right: 80, bottom: 40, left: 48 };

function SwarmPlotInner({
  groups,
  referenceLines = [],
  yDomain = [0, 1],
  formatY = (v) => `${(v * 100).toFixed(0)}\u00a0%`,
  dotSize = 10,
  height = 320,
  margin = DEFAULT_MARGIN,
  onDotClick,
  highlightId,
  width,
}: InnerProps) {
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
    useTooltip<TooltipData>();

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleBand<string>({
    domain: groups.map((g) => g.id),
    range: [0, xMax],
    padding: 0.2,
  });

  const yScale = scaleLinear<number>({
    domain: yDomain,
    range: [yMax, 0],
    clamp: true,
  });

  const yTicks = yScale.ticks(5);
  const faceScale = dotSize / 30;
  const halfDot = dotSize / 2;

  return (
    <div style={{ position: "relative" }}>
      <svg width={width} height={height} overflow="visible">
        <Group left={margin.left} top={margin.top}>
          {/* Y-axis labels */}
          {yTicks.map((tick) => (
            <text
              key={tick}
              x={-10}
              y={yScale(tick)}
              dy="0.35em"
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fill="var(--color-muted-foreground)"
              fontFamily="inherit"
            >
              {formatY(tick)}
            </text>
          ))}

          {/* Vertical dashed column guides at each group centre */}
          {groups.map((group) => {
            const bw = xScale.bandwidth();
            const cx = (xScale(group.id) ?? 0) + bw / 2;
            return (
              <line
                key={`guide-${group.id}`}
                x1={cx}
                x2={cx}
                y1={0}
                y2={yMax}
                stroke="var(--color-border)"
                strokeDasharray="3 3"
                opacity={0.35}
              />
            );
          })}

          {/* Horizontal baseline */}
          <line
            x1={0}
            x2={xMax}
            y1={yMax}
            y2={yMax}
            stroke="var(--color-border)"
            opacity={0.6}
          />

          {/* Reference lines */}
          {referenceLines.map((ref) => (
            <g key={ref.value}>
              <line
                x1={0}
                x2={xMax}
                y1={yScale(ref.value)}
                y2={yScale(ref.value)}
                stroke="var(--color-muted-foreground)"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                opacity={0.7}
              />
              {ref.label && (
                <text
                  x={xMax + 6}
                  y={yScale(ref.value)}
                  dy="0.35em"
                  fontSize={10}
                  fill="var(--color-muted-foreground)"
                  fontFamily="inherit"
                >
                  {ref.label}
                </text>
              )}
            </g>
          ))}

          {/* Groups */}
          {groups.map((group) => {
            const bw = xScale.bandwidth();
            const cx = (xScale(group.id) ?? 0) + bw / 2;
            const maxDx = bw / 2 - halfDot;
            const placed = placeBeeswarm(group.items, (v) => yScale(v), dotSize, Math.max(maxDx, 0));

            return (
              <Group key={group.id} left={cx}>
                {/* X-axis label — party face or text */}
                {group.iconColor && group.iconAbbr ? (
                  <g transform={`translate(${-ICON_SIZE / 2},${yMax + 6})`}>
                    <path
                      d={FACE_PATH}
                      transform={`scale(${ICON_SCALE})`}
                      fill={group.iconColor}
                    />
                    <text
                      x={ICON_SIZE / 2}
                      y={ICON_SIZE * 0.6}
                      textAnchor="middle"
                      fontSize={ICON_FONT_SIZE}
                      fontWeight={700}
                      fontFamily="'Roboto Slab', serif"
                      fill={group.iconTextColor ?? autoTextColor(group.iconColor)}
                    >
                      {group.iconAbbr}
                    </text>
                  </g>
                ) : (
                  <text
                    y={yMax + 24}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--color-muted-foreground)"
                    fontFamily="inherit"
                  >
                    {group.label}
                  </text>
                )}

                {/* Dots — face shape centred at (dx, y); highlighted dot rendered last (on top) */}
                {[...placed]
                  .sort((a, b) => highlightId
                    ? (a.item.id === highlightId ? 1 : 0) - (b.item.id === highlightId ? 1 : 0)
                    : 0)
                  .map(({ item, dx }) => {
                    const isHighlighted = highlightId ? item.id === highlightId : null;
                    const dimmed = isHighlighted === false;
                    return (
                      <g
                        key={item.id}
                        transform={`translate(${dx - halfDot},${yScale(item.value) - halfDot})`}
                        style={{ cursor: onDotClick ? "pointer" : "default" }}
                        onMouseMove={(e: MouseEvent<SVGGElement>) => {
                          const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                          showTooltip({
                            tooltipData: { item, group },
                            tooltipLeft: e.clientX - rect.left,
                            tooltipTop: e.clientY - rect.top,
                          });
                        }}
                        onMouseLeave={hideTooltip}
                        onClick={() => onDotClick?.(item, group)}
                      >
                        <path
                          d={FACE_PATH}
                          transform={`scale(${faceScale})`}
                          style={{ fill: item.color, stroke: item.color }}
                          fillOpacity={dimmed ? 0.12 : isHighlighted ? 0.85 : 0.4}
                          strokeOpacity={dimmed ? 0.2 : isHighlighted ? 1 : 0.7}
                          strokeWidth={(isHighlighted ? 2 : 1) / faceScale}
                        />
                      </g>
                    );
                  })}
              </Group>
            );
          })}
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          left={tooltipLeft}
          top={tooltipTop}
          style={{
            position: "absolute",
            background: "var(--color-surface-0, #fff)",
            border: "1px solid var(--color-border, #e5e7eb)",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 12,
            color: "var(--color-foreground, #111)",
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ fontWeight: 600 }}>{tooltipData.item.label}</div>
          <div style={{ color: "var(--color-muted-foreground, #666)" }}>{tooltipData.group.label}</div>
          <div style={{ marginTop: 2 }}>{formatY(tooltipData.item.value)}</div>
        </TooltipWithBounds>
      )}
    </div>
  );
}

// ─── Responsive wrapper ───────────────────────────────────────────────────────

/**
 * Generic beeswarm (swarm) plot.
 * Dots are constrained within their group's column and only overlap if the
 * column is too narrow to fit them without overlap.
 * Dot shape: square with 3 rounded corners (top-right sharp), like pollster-2026.
 * Design: bg-surface-2 card with border, matching PollScatterplot in mandaty.cz.
 */
export function SwarmPlot({ watermark, ...props }: SwarmPlotProps) {
  const { parentRef, width } = useParentSize({ debounceTime: 100 });
  return (
    <div className="-mx-4 sm:mx-0">
      <div className="bg-surface-2 rounded-badge-xl border border-border flex flex-col gap-3 p-4 overflow-hidden">
        <div ref={parentRef} style={{ width: "100%" }}>
          {width > 0 && <SwarmPlotInner {...props} width={width} />}
        </div>
        {watermark && (
          <div className="flex justify-end pointer-events-none select-none">
            {watermark}
          </div>
        )}
      </div>
    </div>
  );
}
