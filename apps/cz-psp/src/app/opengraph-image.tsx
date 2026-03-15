import { ImageResponse } from "next/og";
import { parliamentConfig } from "@/lib/parliament.config";

export const runtime = "edge";
export const alt = parliamentConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const t = parliamentConfig.translations[parliamentConfig.defaultLang]!;

export default function OgImage() {
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
          background: "#0f172a",
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
            background: "#1e3a5f",
            borderRadius: "24px 24px 24px 0",
          }}
        >
          <span style={{ color: "#f0c040", fontSize: 64, fontWeight: 700 }}>S</span>
        </div>

        {/* Parliament name */}
        <div style={{ color: "#ffffff", fontSize: 52, fontWeight: 700, letterSpacing: "-0.5px" }}>
          {parliamentConfig.name}
        </div>

        {/* Description */}
        <div style={{ color: "#94a3b8", fontSize: 28, maxWidth: 800, textAlign: "center" }}>
          {t.seo.defaultDescription}
        </div>

        {/* Site title */}
        <div style={{ color: "#475569", fontSize: 22, marginTop: 8 }}>
          {t.seo.siteTitle}
        </div>
      </div>
    ),
    { ...size }
  );
}
