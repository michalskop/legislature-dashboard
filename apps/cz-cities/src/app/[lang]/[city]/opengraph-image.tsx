import { ImageResponse } from "next/og";
import { CITIES, getCityConfig, getCityTranslations } from "@/lib/city.config";
import { CityLogotype } from "@/components/CityLogotype";
import { palette } from "@legislature/ui";

// NOTE: no `export const runtime = "edge"` here (unlike apps/cz-psp's
// top-level opengraph-image.tsx) — Next.js disallows combining edge runtime
// with generateStaticParams on an image-generation route. Since this image
// is fully statically generated at build time (dynamicParams = false below),
// the default Node runtime is fine; nothing here runs per-request.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return CITIES.map((city) => ({ city: city.citySlug }));
}
export const dynamicParams = false;

const robotoSlab700 = fetch(
  "https://raw.githubusercontent.com/googlefonts/robotoslab/main/fonts/ttf/RobotoSlab-Bold.ttf"
).then(async (res) => {
  if (!res.ok) {
    throw new Error(`Failed to fetch Roboto Slab font: ${res.status} ${res.statusText}`);
  }
  return res.arrayBuffer();
});

export default async function OgImage({ params }: { params: Promise<{ lang: string; city: string }> }) {
  const { lang, city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  const t = city ? getCityTranslations(city, lang) : undefined;
  const robotoSlab700Data = await robotoSlab700;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: palette.navy9,
          fontFamily: "Roboto Slab, ui-serif, Georgia, serif",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            backgroundImage: `linear-gradient(90deg, ${palette.brand7} 0%, ${palette.navy6} 100%)`,
            borderRadius: "24px 0 24px 24px",
          }}
        >
          <span style={{ color: palette.yellow6, fontSize: 64, fontWeight: 700 }}>M</span>
        </div>

        <div style={{ color: palette.brand6, fontSize: 52, fontWeight: 700, letterSpacing: "-0.5px" }}>
          {city?.name ?? "Města.DataTimes.cz"}
        </div>

        {t && (
          <div style={{ color: palette.navy0, fontSize: 28, maxWidth: 800, textAlign: "center", opacity: 0.85 }}>
            {t.seo.defaultDescription}
          </div>
        )}

        <CityLogotype size="lg" variant="dark" renderMode="inline" />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Roboto Slab",
          data: robotoSlab700Data,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
