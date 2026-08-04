import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { parliamentConfig } from "@/lib/parliament.config";
import { buildMetadata } from "@/lib/metadata";
import { MatomoScript } from "@/components/MatomoScript";

const robotoSlab = Roboto_Slab({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto-slab",
  display: "swap",
});

const t = parliamentConfig.translations[parliamentConfig.defaultLang]!;

export const metadata: Metadata = {
  ...buildMetadata(null),
  icons: { icon: "/favicon.svg" },
  // PLACEHOLDER — per plan.md D1 the eventual URL shape is mesta.datatimes.cz/<city>;
  // no deployment exists yet (that's task A4). Kept as a valid absolute URL so
  // Next.js metadata resolution doesn't fail at build time.
  metadataBase: new URL("https://mesta.datatimes.cz"),
  openGraph: {
    ...buildMetadata(null).openGraph,
    siteName: t.seo.siteTitle,
    locale: `${parliamentConfig.defaultLang}_CZ`,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className={`${robotoSlab.variable} overflow-x-hidden`}>
      <body className="bg-surface-1 text-foreground font-sans antialiased flex flex-col min-h-screen">
        {children}
        {parliamentConfig.matomo && (
          <Suspense>
            <MatomoScript url={parliamentConfig.matomo.url} siteId={parliamentConfig.matomo.siteId} />
          </Suspense>
        )}
      </body>
    </html>
  );
}
