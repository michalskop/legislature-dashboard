import { notFound } from "next/navigation";
import { getAllPartyProfiles } from "@/lib/data";
import { PartyFace } from "@/components/PartyFace";
import { getCityConfig, getCityTranslations } from "@/lib/city.config";
import type { ParliamentTranslations } from "@legislature/parliament-core";
import { buildCityMetadata } from "@/lib/metadata";
import { cityBasePath } from "@/lib/routing";
import Link from "next/link";

interface Props {
  params: Promise<{ lang: string; city: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { lang, city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) return {};
  const t = getCityTranslations(city, lang);
  const groupOrg = city.organizations.find((o) => o.classification === "group");
  const title = groupOrg?.labels[lang]?.listTitle ?? t.home.groupsCardTitle;
  return buildCityMetadata({ city, lang, path: "/groups", title });
}

function pct(v: number | null) {
  if (v === null) return "—";
  return (v * 100).toFixed(1) + " %";
}

type Party = Awaited<ReturnType<typeof getAllPartyProfiles>>[0];

function PartyCard({ party, t, basePath }: { party: Party; t: ParliamentTranslations; basePath: string }) {
  return (
    <Link
      href={`${basePath}/group/${party.slug}`}
      className="bg-surface-2 rounded-badge p-5 hover:bg-surface-3 transition-colors flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PartyFace partyId={party.partyId} size={32} />
          <span className="font-semibold text-lg">{party.name}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {t.ui.memberCount.replace("{n}", String(party.memberCount))}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">{t.metrics.attendance}</div>
          <div className="font-semibold tabular-nums">{pct(party.avgAttendance)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t.metrics.rebelity}</div>
          <div className="font-semibold tabular-nums">{pct(party.avgRebelity)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t.metrics.govity}</div>
          <div className="font-semibold tabular-nums">{pct(party.avgGovity)}</div>
        </div>
      </div>
    </Link>
  );
}

export default async function GroupsPage({ params }: Props) {
  const { lang, city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) notFound();

  const parties = await getAllPartyProfiles(citySlug);
  const t = getCityTranslations(city, lang);
  const basePath = cityBasePath(lang, citySlug);
  const groupOrg = city.organizations.find((o) => o.classification === "group");
  const pageTitle = groupOrg?.labels[lang]?.listTitle ?? groupOrg?.labels[city.defaultLang]?.listTitle ?? t.home.groupsCardTitle;

  const currentParties = parties.filter((p) => p.memberCount > 0);
  const formerParties = parties.filter((p) => p.memberCount === 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{pageTitle}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentParties.map((party) => (
          <PartyCard key={party.groupId} party={party} t={t} basePath={basePath} />
        ))}
      </div>
      {formerParties.length > 0 && (
        <>
          <p className="pt-4 text-sm font-semibold text-muted-foreground">{t.member.former}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formerParties.map((party) => (
              <PartyCard key={party.groupId} party={party} t={t} basePath={basePath} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
