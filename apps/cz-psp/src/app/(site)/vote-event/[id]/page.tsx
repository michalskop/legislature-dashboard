import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { VoteEventGrid } from "@legislature/charts";
import type { VoteEventPartyGroup, VoteEventVoter, VoteEventCounts } from "@legislature/charts";
import { CZ_PSP_PARTY_COLORS, CZ_PSP_PARTY_META } from "@legislature/ui";
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

// Preferred display order (largest/most prominent groups first)
const GROUP_ORDER = [
  "psp:org:1750", // ANO
  "psp:org:1751", // ODS
  "psp:org:1752", // STAN
  "psp:org:1748", // KDU
  "psp:org:1747", // TOP09
  "psp:org:1745", // Piráti
  "psp:org:1746", // SPD
  "psp:org:1749", // Motoristé
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
    const key = v.group_id ?? "other";
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
    const meta = CZ_PSP_PARTY_META[partyId];
    const color = CZ_PSP_PARTY_COLORS[partyId] ?? "#bcbcb0";
    return {
      group_id: gid,
      party_id: partyId,
      label: meta?.shortName ?? gid,
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
        resultLabels={{ pass: "Schváleno", fail: "Zamítnuto", other: ve.result }}
        optionLabels={{
          yes: "pro",
          no: "proti",
          abstain: "zdržel se",
          "not voting": "nehlasoval",
          absent: "nepřítomen",
        }}
      />
    </div>
  );
}
