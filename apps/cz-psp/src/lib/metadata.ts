import type { Metadata } from "next";
import { parliamentConfig } from "@/lib/parliament.config";

const t = parliamentConfig.translations[parliamentConfig.defaultLang]!;
const { siteTitle, titleSuffix, defaultDescription } = t.seo;

/**
 * Build a Next.js Metadata object for a page.
 * Always uses the default language — metadata must be static/crawlable.
 *
 * @param title  Page-specific title (without site suffix), or null for the home page.
 * @param description  Optional override for the description.
 */
export function buildMetadata(title: string | null, description?: string): Metadata {
  const fullTitle = title ? `${title}${titleSuffix}` : siteTitle;
  const desc = description ?? defaultDescription;

  return {
    title: fullTitle,
    description: desc,
    openGraph: {
      title: fullTitle,
      description: desc,
      siteName: siteTitle,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: siteTitle }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: ["/og.png"],
    },
  };
}
