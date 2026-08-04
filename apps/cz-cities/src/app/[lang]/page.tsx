import Link from "next/link";
import { CITIES } from "@/lib/city.config";
import { getSiteTranslations } from "@/lib/site";
import { getCityTranslations } from "@/lib/city.config";
import { cityBasePath } from "@/lib/routing";
import { buildGlobalMetadata } from "@/lib/metadata";
import { CityLogotype } from "@/components/CityLogotype";
import { SiteHeaderGlobal } from "@/components/SiteHeaderGlobal";
import { SiteFooterGlobal } from "@/components/SiteFooterGlobal";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  return buildGlobalMetadata({ lang, title: null });
}

export default async function LandingPage({ params }: Props) {
  const { lang } = await params;
  const t = getSiteTranslations(lang);

  return (
    <>
      <SiteHeaderGlobal lang={lang} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-10">
          <section className="flex flex-col items-center text-center gap-4 py-8">
            <CityLogotype size="lg" />
            <p className="text-muted-foreground text-lg max-w-xl">{t.tagline}</p>
          </section>

          <section className="space-y-4">
            <h1 className="text-2xl font-bold">{t.citiesHeading}</h1>
            <p className="text-sm text-muted-foreground">{t.citiesDescription}</p>

            {CITIES.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noCitiesYet}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CITIES.map((city) => {
                  const ct = getCityTranslations(city, lang);
                  return (
                    <Link
                      key={city.citySlug}
                      href={cityBasePath(lang, city.citySlug)}
                      className="block p-6 bg-surface-2 rounded-badge hover:bg-surface-3 transition-colors"
                    >
                      <h2 className="text-xl font-semibold mb-1">{ct.home.title}</h2>
                      <p className="text-sm text-muted-foreground">{ct.home.description}</p>
                      <p className="text-sm font-medium text-primary mt-3">{t.cityCardCta}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooterGlobal lang={lang} />
    </>
  );
}
