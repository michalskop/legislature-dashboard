import { getAllPartyProfiles } from "@/lib/data";
import { PartyFace } from "@legislature/ui";
import { parliamentConfig } from "@/lib/parliament.config";
import { getLang } from "@/lib/lang";
import { buildMetadata } from "@/lib/metadata";
import Link from "next/link";

const t0 = parliamentConfig.translations[parliamentConfig.defaultLang]!;
const groupOrg0 = parliamentConfig.organizations.find((o) => o.classification === "group");
export const metadata = buildMetadata(
  groupOrg0?.labels[parliamentConfig.defaultLang]?.listTitle ?? t0.home.groupsCardTitle
);

function pct(v: number | null) {
  if (v === null) return "—";
  return (v * 100).toFixed(1) + " %";
}

type Party = Awaited<ReturnType<typeof getAllPartyProfiles>>[0];
type T = NonNullable<(typeof parliamentConfig.translations)[string]>;

function PartyCard({ party, t }: { party: Party; t: T }) {
  return (
    <Link
      href={`/group/${party.slug}`}
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

export default async function StranyPage() {
  const [parties, lang] = await Promise.all([getAllPartyProfiles(), getLang()]);
  const t = parliamentConfig.translations[lang] ?? parliamentConfig.translations[parliamentConfig.defaultLang]!;
  const groupOrg = parliamentConfig.organizations.find((o) => o.classification === "group");
  const pageTitle = groupOrg?.labels[lang]?.listTitle ?? groupOrg?.labels[parliamentConfig.defaultLang]?.listTitle ?? t.home.groupsCardTitle;

  const currentParties = parties.filter((p) => p.memberCount > 0);
  const formerParties = parties.filter((p) => p.memberCount === 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{pageTitle}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentParties.map((party) => (
          <PartyCard key={party.groupId} party={party} t={t} />
        ))}
      </div>
      {formerParties.length > 0 && (
        <>
          <p className="pt-4 text-sm font-semibold text-muted-foreground">{t.member.former}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formerParties.map((party) => (
              <PartyCard key={party.groupId} party={party} t={t} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
