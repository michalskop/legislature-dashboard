import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { LANG_CODES, isValidLang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/metadata";

const robotoSlab = Roboto_Slab({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto-slab",
  display: "swap",
});

// This IS the app's root layout (renders <html>/<body>) even though it sits
// under a dynamic segment — Next.js App Router allows the root layout to be
// the top-most segment folder's layout.tsx, dynamic or not (there is no
// sibling `src/app/layout.tsx`; see `src/app/api/*` for the one other
// top-level branch, which needs no layout since route handlers don't render
// React). This is what makes `<html lang={lang}>` possible without cookies
// or client-side detection — see plan.md D5 / audit T8.
export function generateStaticParams() {
  return LANG_CODES.map((lang) => ({ lang }));
}

// Any [lang] value outside LANG_CODES 404s instead of falling back to a
// default — required by task A2's acceptance checks ("generateStaticParams
// covers configured cities/langs only, others 404").
export const dynamicParams = false;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: "/favicon.svg" },
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  return (
    <html lang={lang} className={`${robotoSlab.variable} overflow-x-hidden`}>
      <body className="bg-surface-1 text-foreground font-sans antialiased flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}
