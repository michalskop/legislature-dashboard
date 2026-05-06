import { ImageResponse } from "next/og";
import { parliamentConfig } from "@/lib/parliament.config";
import { NrsrLogotype } from "@/components/NrsrLogotype";
import { palette } from "@legislature/ui";

export const runtime = "edge";
export const alt = parliamentConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const t = parliamentConfig.translations[parliamentConfig.defaultLang]!;

const robotoSlab700 = fetch(
  "https://raw.githubusercontent.com/googlefonts/robotoslab/main/fonts/ttf/RobotoSlab-Bold.ttf"
).then(async (res) => {
  if (!res.ok) {
    throw new Error(`Failed to fetch Roboto Slab font: ${res.status} ${res.statusText}`);
  }
  return res.arrayBuffer();
});

export default async function OgImage() {
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
        {/* Badge */}
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
          <span style={{ color: palette.yellow6, fontSize: 64, fontWeight: 700 }}>S</span>
        </div>

        {/* Parliament name */}
        <div
          style={{ color: palette.brand6, fontSize: 52, fontWeight: 700, letterSpacing: "-0.5px" }}
        >
          {parliamentConfig.name}
        </div>

        {/* Description */}
        <div
          style={{ color: palette.navy0, fontSize: 28, maxWidth: 800, textAlign: "center", opacity: 0.85 }}
        >
          {t.seo.defaultDescription}
        </div>

        {/* Site title */}
        <NrsrLogotype size="lg" variant="dark" renderMode="inline" />
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
