import { DEFAULT_LANG } from "./i18n";

// Site-wide (non-city) translations for the network landing page ("/", lists
// cities) and the "/about" page — content that describes Města.DataTimes.cz
// as a whole, not any one city. Per-city copy lives in each CityConfig's own
// `translations` (see city.config.ts) since D5 requires the language list to
// be pure config + dictionaries at every level, not just per-city.
export interface SiteTranslations {
  siteTitle: string;
  titleSuffix: string;
  tagline: string;
  defaultDescription: string;
  citiesHeading: string;
  citiesDescription: string;
  cityCardCta: string;
  noCitiesYet: string;
  aboutNavLabel: string;
  footer: {
    aboutSection: string;
    projectsSection: string;
    contactSection: string;
    dataSource: string;
    /** "{date}" is replaced with the newest vote date; "{datetime}" with the last pipeline run. */
    dataAsOf: string;
    lastChecked: string;
  };
}

export const SITE_TRANSLATIONS: Record<string, SiteTranslations> = {
  cs: {
    siteTitle: "Města.DataTimes.cz",
    titleSuffix: " - Města.DataTimes.cz",
    tagline: "Přehled jmenovitých hlasování zastupitelstev českých měst",
    defaultDescription:
      "Otevřený přehled docházky, rebelování a shody s koalicí v zastupitelstvech českých měst na základě jmenovitých hlasování.",
    citiesHeading: "Města",
    citiesDescription: "Vyberte město, jehož zastupitelstvo chcete prozkoumat.",
    cityCardCta: "Zobrazit zastupitelstvo →",
    noCitiesYet: "Zatím není k dispozici žádné město.",
    aboutNavLabel: "O projektu",
    footer: {
      aboutSection: "O projektu",
      projectsSection: "Naše projekty",
      contactSection: "Kontakt",
      dataSource: "Otevřená data jednotlivých měst — viz stránka konkrétního města.",
      dataAsOf: "Data k {date}",
      lastChecked: "poslední kontrola {datetime}",
    },
  },
  en: {
    siteTitle: "Města.DataTimes.cz",
    titleSuffix: " — mesta.datatimes.cz",
    tagline: "Roll-call vote monitor for Czech municipal assemblies",
    defaultDescription:
      "An open dashboard of attendance, rebelliousness, and coalition alignment in Czech municipal assemblies, derived from roll-call votes.",
    citiesHeading: "Cities",
    citiesDescription: "Choose a city to explore its assembly.",
    cityCardCta: "View assembly →",
    noCitiesYet: "No city is available yet.",
    aboutNavLabel: "About",
    footer: {
      aboutSection: "About",
      projectsSection: "Our projects",
      contactSection: "Contact",
      dataSource: "Open data per city — see each city's own page.",
      dataAsOf: "Data as of {date}",
      lastChecked: "last checked {datetime}",
    },
  },
};

export function getSiteTranslations(lang: string): SiteTranslations {
  return SITE_TRANSLATIONS[lang] ?? SITE_TRANSLATIONS[DEFAULT_LANG]!;
}
