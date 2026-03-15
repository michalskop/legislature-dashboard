import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#1b3a6b",
          // 3 rounded corners, top-right sharp — matches FACE_PATH / badge shape
          borderRadius: "8px 0 8px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f5c842",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "serif",
          lineHeight: 1,
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
