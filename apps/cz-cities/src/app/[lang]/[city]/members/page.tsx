import { notFound } from "next/navigation";
import { getAllMpProfiles } from "@/lib/data";
import { SortableMpTable } from "@/components/SortableMpTable";
import { getCityConfig, getCityTranslations } from "@/lib/city.config";
import { buildCityMetadata } from "@/lib/metadata";
import { cityBasePath } from "@/lib/routing";

interface Props {
  params: Promise<{ lang: string; city: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { lang, city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) return {};
  const t = getCityTranslations(city, lang);
  return buildCityMetadata({ city, lang, path: "/members", title: t.member.plural });
}

export default async function MembersPage({ params }: Props) {
  const { lang, city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) notFound();

  const mps = await getAllMpProfiles(citySlug);
  const t = getCityTranslations(city, lang);
  const basePath = cityBasePath(lang, citySlug);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.member.plural}</h1>
      <SortableMpTable
        mps={mps}
        lang={lang}
        labels={t.table}
        formerLabel={t.member.former}
        basePath={basePath}
      />
    </div>
  );
}
