import type { PageBlock, SwarmBlockConfig, ParliamentTranslations } from "@legislature/parliament-core";
import { MpMetricSwarmChart } from "@/components/MpMetricSwarmChart";
import { WpcaScatterChart } from "@/components/WpcaScatterChart";
import { SortableMpTable } from "@/components/SortableMpTable";
import { MetricCard } from "@/components/MetricCard";
import type { MpProfile, PartyProfile } from "@/lib/types";

// Context passed to every block
export interface BlockRenderContext {
  lang: string;
  mps: MpProfile[];             // chart MPs (already filtered to current + highlight)
  parties: PartyProfile[];
  tableMembers?: MpProfile[];   // members shown in table (may differ from chart mps)
  highlightId?: string;
  highlightIds?: string[];
  // for metrics-grid on member page
  metricValues?: {
    attendance?: { value: string; sub?: string; description: string };
    rebelity?:   { value: string; sub?: string; description: string };
    govity?:     { value: string; sub?: string; description: string };
    corrections?: { value: string; sub?: string; description: string };
  };
  showPartyFilter?: boolean;
  formerLabel?: string;
  chartLabels?: {
    average?: string;
    wpcaXLabel?: string;
    wpcaYLabel?: string;
  };
  tableLabels?: ParliamentTranslations["table"];
}

function BlockSection({ title, description, children }: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-1">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {children}
    </section>
  );
}

export function PageBlockRenderer({ blocks, ctx }: { blocks: PageBlock[]; ctx: BlockRenderContext }) {
  return (
    <div className="space-y-10">
      {blocks.map((block) => {
        const labels = block.labels?.[ctx.lang] ?? block.labels?.["en"] ?? {};
        const { title, description } = labels;

        switch (block.config.type) {
          case "swarm-chart": {
            const c = block.config as SwarmBlockConfig;
            return (
              <BlockSection key={block.id} title={title} description={description}>
                <MpMetricSwarmChart
                  mps={ctx.mps}
                  parties={ctx.parties}
                  metric={c.analysis}
                  yMode={c.yMode}
                  yDecimals={c.yDecimals}
                  extraReferenceLines={c.referenceLines}
                  excludeGroupIds={c.excludeGroupIds}
                  highlightId={ctx.highlightId}
                  averageLabel={ctx.chartLabels?.average}
                />
              </BlockSection>
            );
          }

          case "scatter-chart": {
            return (
              <BlockSection key={block.id} title={title} description={description}>
                <WpcaScatterChart
                  mps={ctx.mps}
                  parties={ctx.parties}
                  highlightId={ctx.highlightId}
                  xLabel={ctx.chartLabels?.wpcaXLabel}
                  yLabel={ctx.chartLabels?.wpcaYLabel}
                  highlightIds={ctx.highlightIds}
                />
              </BlockSection>
            );
          }

          case "member-table": {
            const tc = block.config as import("@legislature/parliament-core").MemberTableBlockConfig;
            if (!ctx.tableLabels) return null;
            return (
              <BlockSection key={block.id} title={title} description={description}>
                <SortableMpTable
                  mps={ctx.tableMembers ?? ctx.mps}
                  lang={ctx.lang}
                  labels={ctx.tableLabels}
                  showPartyFilter={tc.showPartyFilter ?? ctx.showPartyFilter ?? true}
                  formerLabel={ctx.formerLabel}
                  columns={tc.columns}
                />
              </BlockSection>
            );
          }

          case "metrics-grid": {
            if (!ctx.metricValues) return null;
            const mv = ctx.metricValues;
            return (
              <div key={block.id} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {mv.attendance && <MetricCard label={mv.attendance.description} value={mv.attendance.value} subValue={mv.attendance.sub} description="" />}
                {mv.rebelity   && <MetricCard label={mv.rebelity.description}   value={mv.rebelity.value}   subValue={mv.rebelity.sub}   description="" />}
                {mv.govity     && <MetricCard label={mv.govity.description}     value={mv.govity.value}     subValue={mv.govity.sub}     description="" />}
                {mv.corrections && <MetricCard label={mv.corrections.description} value={mv.corrections.value} subValue={mv.corrections.sub} description="" />}
              </div>
            );
          }

          case "text": {
            const content = labels.content;
            if (!content) return null;
            return (
              <section key={block.id} className="prose prose-sm max-w-none text-muted-foreground">
                <p>{content}</p>
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
