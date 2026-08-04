import type { Metadata } from "next";
import { LANG_CODES, DEFAULT_LANG } from "./i18n";
import { cityBasePath, globalBasePath } from "./routing";
import type { CityConfig } from "./city.config";
import { getCityTranslations } from "./city.config";
import { getSiteTranslations } from "./site";

// PLACEHOLDER — no real deployment yet (task A4); per plan.md D1 the
// eventual shape is mesta.datatimes.cz/<city>.
export const SITE_URL = "https://mesta.datatimes.cz";

/**
 * hreflang alternates for a path-builder function. Always includes every
 * configured language (see lib/i18n.ts LANGS) plus "x-default" pointing at
 * the default language — this is the real, user-visible SEO payoff of
 * path-prefix i18n (audit T8 / plan.md D5): every language gets a real,
 * crawlable, canonical URL.
 */
function hreflangAlternates(pathFor: (lang: string) => string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const lang of LANG_CODES) {
    languages[lang] = pathFor(lang);
  }
  languages["x-default"] = pathFor(DEFAULT_LANG);
  return languages;
}

/**
 * Metadata for a page inside a city (home, members, member, groups, group,
 * vote-event). `path` is the sub-path within the city, e.g. "" for the city
 * home page, "/members", `/member/${slug}`.
 */
export function buildCityMetadata(opts: {
  city: CityConfig;
  lang: string;
  path?: string;
  title: string | null;
  description?: string;
}): Metadata {
  const { city, lang, path = "", title, description } = opts;
  const t = getCityTranslations(city, lang);
  const fullTitle = title ? `${title}${t.seo.titleSuffix}` : t.seo.siteTitle;
  const desc = description ?? t.seo.defaultDescription;
  const canonicalPath = `${cityBasePath(lang, city.citySlug)}${path}`;

  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: canonicalPath,
      languages: hreflangAlternates((l) => `${cityBasePath(l, city.citySlug)}${path}`),
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      siteName: t.seo.siteTitle,
      type: "website",
      locale: lang,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
    },
  };
}

/** Metadata for site-global pages that aren't scoped to one city ("/", "/about"). */
export function buildGlobalMetadata(opts: {
  lang: string;
  path?: string;
  title: string | null;
  description?: string;
}): Metadata {
  const { lang, path = "", title, description } = opts;
  const t = getSiteTranslations(lang);
  const fullTitle = title ? `${title}${t.titleSuffix}` : t.siteTitle;
  const desc = description ?? t.defaultDescription;
  const canonicalPath = `${globalBasePath(lang)}${path}` || "/";

  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: canonicalPath,
      languages: hreflangAlternates((l) => `${globalBasePath(l)}${path}` || "/"),
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      siteName: t.siteTitle,
      type: "website",
      locale: lang,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
    },
  };
}
