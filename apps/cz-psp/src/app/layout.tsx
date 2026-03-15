import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";

const robotoSlab = Roboto_Slab({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto-slab",
  display: "swap",
});

export const metadata: Metadata = {
  title: "snemovna.datatimes.cz — Poslanecká sněmovna",
  description:
    "Přehled aktivity poslanců a stran v české Poslanecké sněmovně.",
  metadataBase: new URL("https://snemovna.datatimes.cz"),
  openGraph: {
    title: "snemovna.datatimes.cz — Poslanecká sněmovna",
    description:
      "Přehled aktivity poslanců a stran v české Poslanecké sněmovně.",
    siteName: "snemovna.datatimes.cz",
    locale: "cs_CZ",
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
      </body>
    </html>
  );
}
