import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { VoteEventGrid } from "@legislature/charts";
import type { VoteEventPartyGroup, VoteEventVoter, VoteEventCounts } from "@legislature/charts";
import { SK_NRSR_PARTY_COLORS, SK_NRSR_PARTY_META } from "@legislature/ui";
import { groupIdToPartyId } from "@/lib/groups";

interface RawVoteEvent {
  id: string;
  parliament: string;
  date: string;
  title: string;
  result: string;
  counts: VoteEventCounts;
  votes: VoteEventVoter[];
}

// Group canonical names derived from standardize.py club IDs
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

// Order groups on the page (coalition first, then opposition)
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
  // Append any unknown groups not in the order list
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

export default async function VoteEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ve = await loadVoteEvent(id);
  if (!ve) notFound();

  const groups = buildGroups(ve.votes);

  return (
    <div className="space-y-6">
      <VoteEventGrid
        title={ve.title}
        date={ve.date}
        result={ve.result}
        counts={ve.counts}
        groups={groups}
        dotSize={16}
        resultLabels={{ pass: "Schválené", fail: "Zamietnuté", other: ve.result }}
        optionLabels={{
          yes: "za",
          no: "proti",
          abstain: "zdržal sa",
          "not voting": "nehlasoval",
          absent: "neprítomný",
        }}
      />
    </div>
  );
}
