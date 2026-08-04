import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CITIES, getCityConfig } from "@/lib/city.config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MatomoScript } from "@/components/MatomoScript";

// Enumerates exactly the configured cities for whatever [lang] the parent
// segment resolved to (Next.js calls this once per parent generateStaticParams
// result, passing the already-resolved `params.lang` in — see
// src/app/[lang]/layout.tsx). Together with that parent, this is the "cross
// product of configured (language x city) combinations" the A2 acceptance
// checks require — nothing more, nothing less.
export function generateStaticParams() {
  return CITIES.map((city) => ({ city: city.citySlug }));
}

// Any [city] value not in CITIES 404s instead of falling back to a default
// or rendering dynamically — required by task A2's acceptance checks.
export const dynamicParams = false;

export default async function CityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string; city: string }>;
}) {
  const { lang, city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) notFound();

  return (
    <>
      <SiteHeader lang={lang} city={city} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <SiteFooter lang={lang} city={city} />
      {city.matomo && (
        <Suspense>
          <MatomoScript url={city.matomo.url} siteId={city.matomo.siteId} />
        </Suspense>
      )}
    </>
  );
}
