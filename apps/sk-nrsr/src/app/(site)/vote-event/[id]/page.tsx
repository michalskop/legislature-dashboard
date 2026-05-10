import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { VoteEventGrid } from "@legislature/charts";
import type { VoteEventPartyGroup, VoteEventVoter, VoteEventPolarityCounts } from "@legislature/charts";
import { SK_NRSR_PARTY_COLORS, SK_NRSR_PARTY_META } from "@legislature/ui";
import { groupIdToPartyId } from "@/lib/groups";
import { NrsrLogotype } from "@/components/NrsrLogotype";

interface RawVoteEvent {
  id: string;
  parliament_id: string;
  start_date: string;
  title?: string;
  result: "pass" | "fail" | null;
  requirement?: string;
  required_count?: number;
  definition_name: string | null;
  polarity_counts: VoteEventPolarityCounts;
  votes: VoteEventVoter[];
}

const GROUP_LABELS: Record<string, string> = {
  "nrsr:org:club:1": "HLAS - sociálna demokracia",
  "nrsr:org:club:2": "KDH",
  "nrsr:org:club:3": "Progresívne Slovensko",
  "nrsr:org:club:4": "SLOVENSKO - ZA ĽUDÍ",
  "nrsr:org:club:5": "SMER - sociálna demokracia",
  "nrsr:org:club:6": "Sloboda a Solidarita",
  "nrsr:org:club:7": "Slovenská národná strana",
  "nrsr:org:nezavisli": "Nezávislí",
};

const GROUP_ORDER = [
  "nrsr:org:club:5",
  "nrsr:org:club:1",
  "nrsr:org:club:7",
  "nrsr:org:club:3",
  "nrsr:org:club:4",
  "nrsr:org:club:6",
  "nrsr:org:club:2",
  "nrsr:org:nezavisli",
];

const REQUIREMENT_LABELS: Record<string, string> = {
  "simple majority": "jednoduchá väčšina",
  "absolute majority": "absolútna väčšina",
  "3/5": "3/5 väčšina",
  "2/3": "2/3 väčšina",
};

async function loadVoteEvent(id: string): Promise<RawVoteEvent | null> {
  const filePath = join(process.cwd(), "src/data/vote-events", `${id}.json`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as RawVoteEvent;
  } catch {
    return null;
  }
}

function buildGroups(votes: VoteEventVoter[]): VoteEventPartyGroup[] {
  const byGroup = new Map<string, VoteEventVoter[]>();
  for (const v of votes) {
    const key = v.group_id ?? "nrsr:org:nezavisli";
    const arr = byGroup.get(key) ?? [];
    arr.push(v);
    byGroup.set(key, arr);
  }

  const ordered = GROUP_ORDER.filter((g) => byGroup.has(g));
  for (const g of byGroup.keys()) {
    if (!ordered.includes(g)) ordered.push(g);
  }

  return ordered.map((gid) => {
    const partyId = groupIdToPartyId(gid);
    const meta = SK_NRSR_PARTY_META[partyId];
    const color = SK_NRSR_PARTY_COLORS[partyId] ?? "#bcbcb0";
    return {
      group_id: gid,
      party_id: partyId,
      label: GROUP_LABELS[gid] ?? gid,
      iconColor: color,
      iconAbbr: meta?.faceAbbr ?? partyId.toUpperCase(),
      iconTextColor: meta?.darkText ? "#1a1a1a" : "#ffffff",
      voters: byGroup.get(gid) ?? [],
    };
  });
}

const LAYOUTS = [
  { key: "wp", label: "Hlasovanie" },
  { key: "tabule", label: "Tabuľa" },
  { key: "polarity-first", label: "Podľa výsledku" },
  { key: "party-first", label: "Podľa klubu" },
] as const;

type Layout = (typeof LAYOUTS)[number]["key"];

function isLayout(v: string | undefined): v is Layout {
  return LAYOUTS.some((l) => l.key === v);
}

export default async function VoteEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const rawLayout = typeof sp.layout === "string" ? sp.layout : undefined;
  const layout: Layout = isLayout(rawLayout) ? rawLayout : "wp";

  const ve = await loadVoteEvent(id);
  if (!ve) notFound();

  const groups = buildGroups(ve.votes);

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {LAYOUTS.map((l) => (
          <a
            key={l.key}
            href={`?layout=${l.key}`}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              layout === l.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </a>
        ))}
      </div>
      <VoteEventGrid
        title={ve.title ?? ve.id}
        date={ve.start_date}
        result={ve.result}
        requirement={ve.requirement ? (REQUIREMENT_LABELS[ve.requirement] ?? ve.requirement) : undefined}
        requirementCountLabel="potrebné"
        logo={<NrsrLogotype size="xs" variant="mono" color="var(--color-surface-8)" />}
        required_count={ve.required_count}
        polarity_counts={ve.polarity_counts}
        groups={groups}
        dotSize={16}
        layout={layout}
        resultLabels={{ pass: "Schválené", fail: "Zamietnuté" }}
        polarityLabels={{ support: "Za", oppose: "Proti", neutral: "Nehlasoval/Neprítomný" }}
      />
    </div>
  );
}
