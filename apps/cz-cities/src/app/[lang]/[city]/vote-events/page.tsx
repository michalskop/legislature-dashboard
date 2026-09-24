import { readdir, readFile } from "fs/promises";
import { join } from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCityConfig } from "@/lib/city.config";
import { buildCityMetadata } from "@/lib/metadata";
import { cityBasePath } from "@/lib/routing";
import { getCityVoteEvents } from "@/lib/vote-events";

interface VoteEventSummary {
  id: string;
  start_date: string;
  title?: string;
  result: "pass" | "fail" | null;
  polarity_counts: {
    support: number;
    oppose: number;
    neutral: number;
  };
  votes: Array<{ option: string }>;
}

interface Props {
  params: Promise<{ lang: string; city: string }>;
}

const LABELS = {
  cs: {
    title: "Hlasování",
    empty: "Pro toto město zatím nejsou dostupná žádná jmenovitá hlasování.",
    support: "pro",
    oppose: "proti",
    abstain: "se zdrželo",
    didNotVote: "nehlasovalo / chybělo",
    pass: "Schváleno",
    fail: "Zamítnuto",
  },
  en: {
    title: "Votes",
    empty: "No roll-call votes are available for this city yet.",
    support: "for",
    oppose: "against",
    abstain: "abstained",
    didNotVote: "absent / did not vote",
    pass: "Passed",
    fail: "Rejected",
  },
} as const;

function labelsFor(lang: string) {
  return lang === "en" ? LABELS.en : LABELS.cs;
}

function optionCounts(event: VoteEventSummary) {
  const abstain = event.votes.filter((vote) => vote.option === "abstain").length;
  return {
    abstain,
    didNotVote: event.polarity_counts.neutral - abstain,
  };
}

async function loadVoteEvents(citySlug: string): Promise<VoteEventSummary[]> {
  if (getCityConfig(citySlug)?.hasVoteEvents) return getCityVoteEvents(citySlug);
  const directory = join(process.cwd(), "src/data/vote-events", citySlug);

  try {
    const filenames = (await readdir(directory)).filter((name) => name.endsWith(".json"));
    const events = await Promise.all(
      filenames.map(async (filename) => {
        const raw = await readFile(join(directory, filename), "utf-8");
        return JSON.parse(raw) as VoteEventSummary;
      }),
    );

    return events.sort((a, b) => b.start_date.localeCompare(a.start_date));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const { lang, city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) return {};

  return buildCityMetadata({
    city,
    lang,
    path: "/vote-events",
    title: labelsFor(lang).title,
  });
}

export default async function VoteEventsPage({ params }: Props) {
  const { lang, city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) notFound();

  const events = await loadVoteEvents(citySlug);
  const labels = labelsFor(lang);
  const basePath = cityBasePath(lang, citySlug);
  const dateFormatter = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{labels.title}</h1>

      {events.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="divide-y divide-border">
          {events.map((event) => {
            const counts = optionCounts(event);
            return (
              <Link
                key={event.id}
                href={`${basePath}/vote-event/${event.id}`}
                className="flex flex-col gap-2 py-4 first:pt-0 hover:text-primary transition-colors sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <h2 className="font-semibold">{event.title ?? event.id}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {dateFormatter.format(new Date(event.start_date))}
                  </p>
                </div>
                <div className="shrink-0 text-sm text-muted-foreground sm:text-right">
                  {event.result && (
                    <p className="font-medium text-foreground">
                      {event.result === "pass" ? labels.pass : labels.fail}
                    </p>
                  )}
                  <p>
                    {event.polarity_counts.support} {labels.support} · {event.polarity_counts.oppose}{" "}
                    {labels.oppose} · {counts.abstain} {labels.abstain} · {counts.didNotVote}{" "}
                    {labels.didNotVote}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
