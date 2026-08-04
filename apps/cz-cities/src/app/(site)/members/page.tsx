import { getAllMpProfiles } from "@/lib/data";
import { SortableMpTable } from "@/components/SortableMpTable";
import { parliamentConfig } from "@/lib/parliament.config";
import { getLang } from "@/lib/lang";
import { buildMetadata } from "@/lib/metadata";

const t0 = parliamentConfig.translations[parliamentConfig.defaultLang]!;
export const metadata = buildMetadata(t0.member.plural);

export default async function MembersPage() {
  const [mps, lang] = await Promise.all([getAllMpProfiles(), getLang()]);
  const t = parliamentConfig.translations[lang] ?? parliamentConfig.translations[parliamentConfig.defaultLang]!;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.member.plural}</h1>
      <SortableMpTable mps={mps} lang={lang} labels={t.table} formerLabel={t.member.former} />
    </div>
  );
}
