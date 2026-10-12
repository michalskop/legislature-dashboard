import type { VoteEventVoter, VoteEventPolarityCounts } from "@legislature/charts";
import { parseCsv } from "./csv";
import { getCityConfig } from "./city.config";

interface StandardVoteEvent {
  id: string;
  identifier?: string;
  start_date: string;
  status: string;
  counts: Array<{ option: string; value: number }>;
  extras?: {
    sitting_number?: number;
    topic?: string;
    topic_description?: string;
    result?: "pass" | "fail" | null;
  };
}

interface MembershipRow {
  person_id: string;
  organization_id: string;
  start_date: string;
  end_date: string;
}

export interface CityVoteEvent {
  id: string;
  parliament_id: string;
  start_date: string;
  title: string;
  identifier?: string;
  topic_description?: string;
  definition_name: string | null;
  result: "pass" | "fail" | null;
  polarity_counts: VoteEventPolarityCounts;
  votes: VoteEventVoter[];
}

const REVALIDATE = 3600;

function dataBaseFor(citySlug: string) {
  const city = getCityConfig(citySlug);
  if (!city) throw new Error(`Unknown citySlug: ${citySlug}`);
  return city.dataBase.replace(/\/analyses$/, "/data");
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

function polarity(option: string): VoteEventVoter["polarity"] {
  if (option === "yes") return "support";
  if (option === "no") return "oppose";
  return "neutral";
}

export async function getCityVoteEvents(citySlug: string): Promise<CityVoteEvent[]> {
  const base = dataBaseFor(citySlug);
  const [eventText, voteText, personText, organizationText, membershipText] = await Promise.all([
    fetchText(`${base}/vote_events.json`),
    fetchText(`${base}/votes.csv`),
    fetchText(`${base}/persons.csv`),
    fetchText(`${base}/organizations.csv`),
    fetchText(`${base}/memberships.csv`),
  ]);

  const standardEvents = JSON.parse(eventText) as StandardVoteEvent[];
  const votesByEvent = new Map<string, VoteEventVoter[]>();
  const people = new Map(parseCsv(personText).map((person) => [person.id ?? "", person.name ?? ""]));
  const groupIds = new Set(
    parseCsv(organizationText)
      .filter((organization) => organization.classification === "group")
      .map((organization) => organization.id ?? ""),
  );
  const memberships: MembershipRow[] = parseCsv(membershipText).map((row) => ({
    person_id: row.person_id ?? "",
    organization_id: row.organization_id ?? "",
    start_date: row.start_date ?? "",
    end_date: row.end_date ?? "",
  }));
  const groupsByPerson = new Map<string, MembershipRow[]>();
  for (const membership of memberships) {
    if (!groupIds.has(membership.organization_id)) continue;
    const personGroups = groupsByPerson.get(membership.person_id) ?? [];
    personGroups.push(membership);
    groupsByPerson.set(membership.person_id, personGroups);
  }
  for (const row of parseCsv(voteText)) {
    const eventId = row.vote_event_id ?? "";
    const voterId = row.voter_id ?? "";
    const option = row.option ?? "";
    if (!eventId || !voterId || row.voter_type !== "person") continue;
    const voters = votesByEvent.get(eventId) ?? [];
    voters.push({
      voter_id: voterId,
      option,
      polarity: polarity(option),
      name: people.get(voterId) ?? voterId,
      group_id: null,
    });
    votesByEvent.set(eventId, voters);
  }

  return standardEvents
    .filter((event) => event.status === "valid")
    .map((event) => {
      const counts = new Map(event.counts.map((count) => [count.option, count.value]));
      const voteDate = event.start_date.slice(0, 10);
      const votes = (votesByEvent.get(event.id) ?? []).map((vote) => {
        const membership = (groupsByPerson.get(vote.voter_id) ?? []).find((group) =>
          group.start_date <= voteDate && (!group.end_date || voteDate < group.end_date),
        );
        return { ...vote, group_id: membership?.organization_id ?? null };
      });
      const support = counts.get("yes") ?? 0;
      const oppose = counts.get("no") ?? 0;
      const abstain = counts.get("abstain") ?? 0;
      const absent = counts.get("absent") ?? 0;
      return {
        id: event.id,
        parliament_id: citySlug,
        start_date: event.start_date,
        title: event.extras?.topic ?? event.identifier ?? event.id,
        identifier: event.identifier,
        topic_description: event.extras?.topic_description,
        definition_name: null,
        result: event.extras?.result ?? null,
        polarity_counts: {
          support,
          oppose,
          neutral: abstain + absent,
          total: support + oppose + abstain + absent,
        },
        votes,
      };
    })
    .sort((a, b) => b.start_date.localeCompare(a.start_date) || b.id.localeCompare(a.id));
}
