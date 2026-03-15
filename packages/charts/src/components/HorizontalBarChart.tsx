"use client";

import { scaleBand, scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import type { MouseEvent } from "react";

export interface BarDatum {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface HorizontalBarChartProps {
  data: BarDatum[];
  width: number;
  height: number;
  /** Max value for the x-axis; defaults to max of data */
  maxValue?: number;
  /** Format function for tooltip value display */
  formatValue?: (v: number) => string;
  marginLeft?: number;
  marginRight?: number;
}

export function HorizontalBarChart({
  data,
  width,
  height,
  maxValue,
  formatValue = (v) => String(v),
  marginLeft = 0,
  marginRight = 8,
}: HorizontalBarChartProps) {
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop, tooltipOpen } =
    useTooltip<BarDatum>();

  const xMax = width - marginLeft - marginRight;
  const yMax = height;

  const domainMax = maxValue ?? Math.max(...data.map((d) => d.value));

  const xScale = scaleLinear<number>({
    domain: [0, domainMax],
    range: [0, xMax],
    clamp: true,
  });

  const yScale = scaleBand<string>({
    domain: data.map((d) => d.id),
    range: [0, yMax],
    padding: 0.25,
  });

  const barHeight = yScale.bandwidth();

  return (
    <div style={{ position: "relative" }}>
      <svg width={width} height={height}>
        <Group left={marginLeft}>
          {data.map((d) => {
            const barWidth = xScale(d.value);
            const barY = yScale(d.id) ?? 0;
            return (
              <Bar
                key={d.id}
                x={0}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={d.color ?? "var(--color-primary)"}
                rx={2}
                onMouseMove={(e: MouseEvent<SVGRectElement>) => {
                  const point = localPoint(e);
                  showTooltip({
                    tooltipData: d,
                    tooltipLeft: point?.x ?? 0,
                    tooltipTop: point?.y ?? 0,
                  });
                }}
                onMouseLeave={hideTooltip}
              />
            );
          })}
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds left={tooltipLeft} top={tooltipTop}>
          <span className="text-xs font-semibold">{tooltipData.label}</span>
          <span className="ml-2 text-xs">{formatValue(tooltipData.value)}</span>
        </TooltipWithBounds>
      )}
    </div>
  );
}
