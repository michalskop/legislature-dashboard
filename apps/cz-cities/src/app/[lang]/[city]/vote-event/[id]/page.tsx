import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { VoteEventGrid } from "@legislature/charts";
import type { VoteEventPartyGroup, VoteEventVoter, VoteEventPolarityCounts } from "@legislature/charts";
import { PARTY_COLORS, PARTY_META } from "@/lib/parties";
import { groupIdToPartyId } from "@/lib/groups";
import { getCityConfig } from "@/lib/city.config";
import { CityLogotype } from "@/components/CityLogotype";
import { getCityVoteEvents } from "@/lib/vote-events";

interface RawVoteEvent {
  id: string;
  parliament_id: string;
  start_date: string;
  title?: string;
  identifier?: string;
  topic_description?: string;
  result: "pass" | "fail" | null;
  requirement?: string;
  required_count?: number;
  definition_name: string | null;
  polarity_counts: VoteEventPolarityCounts;
  votes: VoteEventVoter[];
}

const REQUIREMENT_LABELS: Record<string, string> = {
  "simple majority": "prostá většina",
  "absolute majority": "absolutní většina",
  "3/5": "3/5 většina",
  "2/3": "2/3 většina",
};

async function loadVoteEvent(citySlug: string, id: string): Promise<RawVoteEvent | null> {
  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }

  const canonicalPrefix = `${citySlug}:vote-event:`;
  if (getCityConfig(citySlug)?.hasVoteEvents) {
    const canonicalId = id.startsWith(canonicalPrefix) ? id : `${canonicalPrefix}${id}`;
    return (await getCityVoteEvents(citySlug)).find((event) => event.id === canonicalId) ?? null;
  }
  const fileId = id.startsWith(canonicalPrefix) ? id.slice(canonicalPrefix.length) : id;

  // Event files use the source identifier as their filename (for example
  // `4103.json`), while their canonical `id` may be namespaced
  // (`brno:vote-event:4103`). Accept both URL forms, but only allow a plain
  // filename component to reach the filesystem.
  if (!fileId || fileId.includes("/") || fileId.includes("\\")) return null;

  try {
    const filePath = join(process.cwd(), "src/data/vote-events", citySlug, `${fileId}.json`);
    const raw = await readFile(filePath, "utf-8");
    const event = JSON.parse(raw) as RawVoteEvent;
    return event.id === id || event.id === fileId || event.id === `${canonicalPrefix}${fileId}` ? event : null;
  } catch {
    return null;
  }
}

function buildGroups(votes: VoteEventVoter[], ungroupedLabel?: string): VoteEventPartyGroup[] {
  const byGroup = new Map<string, VoteEventVoter[]>();
  for (const v of votes) {
    const key = v.group_id ?? "other";
    const arr = byGroup.get(key) ?? [];
    arr.push(v);
    byGroup.set(key, arr);
  }

  // No fixed GROUP_ORDER here (unlike apps/cz-psp, which orders by a
  // hardcoded list of well-known party org IDs) — Praha's groups come from
  // D7's candidate-list fallback and aren't a stable "well-known" set the
  // way parliamentary party IDs are. Sort by voter count instead.
  const ordered = Array.from(byGroup.keys()).sort((a, b) => (byGroup.get(b)?.length ?? 0) - (byGroup.get(a)?.length ?? 0));

  return ordered.map((gid) => {
    const partyId = groupIdToPartyId(gid);
    const meta = PARTY_META[partyId];
    const color = PARTY_COLORS[partyId] ?? "#bcbcb0";
    return {
      group_id: gid,
      party_id: partyId,
      label: ungroupedLabel ?? meta?.shortName ?? gid,
      iconColor: color,
      iconAbbr: meta?.faceAbbr ?? partyId.toUpperCase(),
      iconTextColor: meta?.darkText ? "#1a1a1a" : "#ffffff",
      voters: byGroup.get(gid) ?? [],
    };
  });
}

const LAYOUTS = [
  { key: "wp", label: "Hlasování" },
  { key: "tabule", label: "Tabule" },
  { key: "polarity-first", label: "Podle výsledku" },
  { key: "party-first", label: "Podle klubu" },
] as const;

type Layout = (typeof LAYOUTS)[number]["key"];

function isLayout(v: string | undefined): v is Layout {
  return LAYOUTS.some((l) => l.key === v);
}

export default async function VoteEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; city: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang, city: citySlug, id } = await params;
  const city = getCityConfig(citySlug);
  if (!city) notFound();

  const sp = await searchParams;
  const rawLayout = typeof sp.layout === "string" ? sp.layout : undefined;
  const hasGroups = city.organizations.some((organization) => organization.classification === "group");
  const availableLayouts = hasGroups ? LAYOUTS : LAYOUTS.filter((item) => item.key !== "party-first");
  const layout: Layout = isLayout(rawLayout) && availableLayouts.some((item) => item.key === rawLayout) ? rawLayout : "wp";

  const ve = await loadVoteEvent(citySlug, id);
  if (!ve) notFound();

  const groups = buildGroups(
    ve.votes,
    hasGroups ? undefined : lang === "en" ? "Assembly members" : "Zastupitelé",
  );
  const isEnglish = lang === "en";

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {availableLayouts.map((l) => (
          <a
            key={l.key}
            href={`?layout=${l.key}`}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              layout === l.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isEnglish
              ? ({ wp: "Vote", tabule: "Board", "polarity-first": "By result", "party-first": "By group" } as const)[l.key]
              : l.label}
          </a>
        ))}
      </div>
      <VoteEventGrid
        title={ve.title ?? ve.id}
        date={ve.start_date}
        result={ve.result}
        requirement={ve.requirement ? (REQUIREMENT_LABELS[ve.requirement] ?? ve.requirement) : undefined}
        requirementCountLabel="potřebné"
        logo={<CityLogotype size="xs" variant="mono" color="var(--color-surface-8)" />}
        required_count={ve.required_count}
        polarity_counts={ve.polarity_counts}
        groups={groups}
        dotSize={16}
        layout={layout}
        resultLabels={isEnglish ? { pass: "Passed", fail: "Rejected" } : { pass: "Schváleno", fail: "Zamítnuto" }}
        polarityLabels={isEnglish
          ? { support: "For", oppose: "Against", neutral: "Abstained / absent" }
          : { support: "Pro", oppose: "Proti", neutral: "Zdržel se / nepřítomen" }}
      />
      {(ve.identifier || ve.topic_description) && (
        <section className="space-y-2 rounded border border-border bg-surface-0 p-4 text-sm">
          {ve.identifier && <p className="font-semibold">{ve.identifier}</p>}
          {ve.topic_description && <p className="whitespace-pre-wrap text-muted-foreground">{ve.topic_description}</p>}
        </section>
      )}
    </div>
  );
}
