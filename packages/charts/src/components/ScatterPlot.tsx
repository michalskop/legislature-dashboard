"use client";

import { scaleLinear } from "@visx/scale";
import { Group } from "@visx/group";
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { useParentSize } from "@visx/responsive";
import type { MouseEvent, ReactNode } from "react";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ScatterDatum {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

export interface ScatterGroup {
  id: string;
  label: string;
  /** Color used for the legend face */
  color: string;
  /** Short abbreviation shown inside the legend face */
  abbr?: string;
  /** Legend face text color — auto-contrasted if omitted */
  textColor?: string;
  items: ScatterDatum[];
}

export interface ScatterPlotProps {
  groups: ScatterGroup[];
  /** Auto-computed from data if omitted */
  xDomain?: [number, number];
  /** Auto-computed from data if omitted */
  yDomain?: [number, number];
  formatX?: (v: number) => string;
  formatY?: (v: number) => string;
  xLabel?: string;
  yLabel?: string;
  /** Dot size in px, default 10 */
  dotSize?: number;
  /** Chart height in px, default 360 */
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  onDotClick?: (item: ScatterDatum, group: ScatterGroup) => void;
  watermark?: ReactNode;
  /** Highlight a single dot by id — all others are dimmed */
  highlightId?: string;
  /** Highlight a set of dots by id — all others are dimmed */
  highlightIds?: string[];
}

// ─── Dot shape ────────────────────────────────────────────────────────────────

const FACE_PATH =
  "M 11.29 0 Q 0 0 0 11.29 L 0 18.71 Q 0 30 11.29 30 L 18.71 30 Q 30 30 30 18.71 L 30 0 L 11.29 0 Z";

const LEGEND_SIZE = 22;
const LEGEND_SCALE = LEGEND_SIZE / 30;
const LEGEND_FONT = 9 * Math.pow(LEGEND_SIZE / 42, 0.25);

function autoTextColor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#1a1a1a" : "#ffffff";
}

function nicePad(values: number[], pad = 0.1): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return [min - range * pad, max + range * pad];
}

// ─── Inner chart ──────────────────────────────────────────────────────────────

interface TooltipData {
  item: ScatterDatum;
  group: ScatterGroup;
}

interface InnerProps extends ScatterPlotProps {
  width: number;
  allX: number[];
  allY: number[];
  highlightId?: string;
  highlightIds?: string[];
}

const DEFAULT_MARGIN = { top: 16, right: 24, bottom: 40, left: 48 };

function ScatterPlotInner({
  groups,
  xDomain,
  yDomain,
  formatX = (v) => v.toFixed(1),
  formatY = (v) => v.toFixed(1),
  xLabel,
  yLabel,
  dotSize = 10,
  height = 360,
  margin = DEFAULT_MARGIN,
  onDotClick,
  highlightId,
  highlightIds,
  width,
  allX,
  allY,
}: InnerProps) {
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
    useTooltip<TooltipData>();

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleLinear<number>({
    domain: xDomain ?? nicePad(allX),
    range: [0, xMax],
    nice: true,
  });

  const yScale = scaleLinear<number>({
    domain: yDomain ?? nicePad(allY),
    range: [yMax, 0],
    nice: true,
  });

  const xTicks = xScale.ticks(5);
  const yTicks = yScale.ticks(5);
  const halfDot = dotSize / 2;
  const faceScale = dotSize / 30;

  return (
    <div style={{ position: "relative" }}>
      <svg width={width} height={height} overflow="visible">
        <Group left={margin.left} top={margin.top}>
          {/* Y gridlines + labels */}
          {yTicks.map((t) => (
            <g key={`gy-${t}`}>
              <line
                x1={0} x2={xMax}
                y1={yScale(t)} y2={yScale(t)}
                stroke="var(--color-border)"
                strokeDasharray={t === 0 ? undefined : "3 3"}
                opacity={t === 0 ? 0.6 : 0.35}
              />
              <text
                x={-8} y={yScale(t)}
                dy="0.35em" textAnchor="end" dominantBaseline="middle"
                fontSize={11} fill="var(--color-muted-foreground)" fontFamily="inherit"
              >
                {formatY(t)}
              </text>
            </g>
          ))}

          {/* X gridlines + labels */}
          {xTicks.map((t) => (
            <g key={`gx-${t}`}>
              <line
                x1={xScale(t)} x2={xScale(t)}
                y1={0} y2={yMax}
                stroke="var(--color-border)"
                strokeDasharray={t === 0 ? undefined : "3 3"}
                opacity={t === 0 ? 0.6 : 0.35}
              />
              <text
                x={xScale(t)} y={yMax + 16}
                textAnchor="middle"
                fontSize={11} fill="var(--color-muted-foreground)" fontFamily="inherit"
              >
                {formatX(t)}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          {xLabel && (
            <text
              x={xMax / 2} y={yMax + 34}
              textAnchor="middle"
              fontSize={11} fill="var(--color-muted-foreground)" fontFamily="inherit"
            >
              {xLabel}
            </text>
          )}
          {yLabel && (
            <text
              x={-(yMax / 2)} y={-36}
              textAnchor="middle"
              fontSize={11} fill="var(--color-muted-foreground)" fontFamily="inherit"
              transform="rotate(-90)"
            >
              {yLabel}
            </text>
          )}

          {/* Dots — highlighted dot rendered last (on top) */}
          {groups.flatMap((group) =>
            [...group.items]
              .sort((a, b) => {
                const hSet = highlightIds ? new Set(highlightIds) : null;
                const aH = highlightId ? a.id === highlightId : hSet ? hSet.has(a.id) : false;
                const bH = highlightId ? b.id === highlightId : hSet ? hSet.has(b.id) : false;
                return (aH ? 1 : 0) - (bH ? 1 : 0);
              })
              .map((item) => {
                const highlightSet = highlightIds ? new Set(highlightIds) : null;
                const isHighlighted = highlightId
                  ? item.id === highlightId
                  : highlightSet
                  ? highlightSet.has(item.id)
                  : null;
                const dimmed = isHighlighted === false;
                return (
                  <g
                    key={item.id}
                    transform={`translate(${xScale(item.x) - halfDot},${yScale(item.y) - halfDot})`}
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
              })
          )}
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
          <div style={{ marginTop: 2, fontSize: 11 }}>
            {formatX(tooltipData.item.x)} · {formatY(tooltipData.item.y)}
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function ScatterLegend({ groups }: { groups: ScatterGroup[] }) {
  return (
    <div className="flex flex-wrap gap-2 px-1 pt-1">
      {groups.map((g) => (
        <div key={g.id} className="flex items-center gap-1.5">
          <svg width={LEGEND_SIZE} height={LEGEND_SIZE} style={{ display: "block", flexShrink: 0 }}>
            <path d={FACE_PATH} transform={`scale(${LEGEND_SCALE})`} fill={g.color} />
            {g.abbr && (
              <text
                x={LEGEND_SIZE / 2} y={LEGEND_SIZE * 0.6}
                textAnchor="middle"
                fontSize={LEGEND_FONT} fontWeight={700}
                fontFamily="'Roboto Slab', serif"
                fill={g.textColor ?? autoTextColor(g.color)}
              >
                {g.abbr}
              </text>
            )}
          </svg>
          <span className="text-xs text-muted-foreground">{g.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Responsive wrapper ───────────────────────────────────────────────────────

/**
 * Generic 2D scatter plot.
 * Same visual design as SwarmPlot (bg-surface-2 card, face-shaped dots).
 */
export function ScatterPlot({ watermark, groups, highlightId, highlightIds, ...props }: ScatterPlotProps) {
  const { parentRef, width } = useParentSize({ debounceTime: 100 });

  const allX = groups.flatMap((g) => g.items.map((d) => d.x));
  const allY = groups.flatMap((g) => g.items.map((d) => d.y));

  return (
    <div className="-mx-4 sm:mx-0">
      <div className="bg-surface-2 rounded-badge-xl border border-border flex flex-col gap-3 p-4 overflow-hidden">
        <ScatterLegend groups={groups} />
        <div ref={parentRef} style={{ width: "100%" }}>
          {width > 0 && allX.length > 0 && (
            <ScatterPlotInner {...props} groups={groups} width={width} allX={allX} allY={allY} highlightId={highlightId} highlightIds={highlightIds} />
          )}
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
