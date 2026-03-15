import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Badge shape: square with 3 rounded corners, top-right sharp — same as FACE_PATH in charts
const FACE_PATH =
  "M 11.29 0 Q 0 0 0 11.29 L 0 18.71 Q 0 30 11.29 30 L 18.71 30 Q 30 30 30 18.71 L 30 0 L 11.29 0 Z";

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
      >
        {/* Scale the 30×30 path to fit 32×32 with 1px margin */}
        <g transform="translate(1,1) scale(1.0667)">
          <path d={FACE_PATH} fill="#1b3a6b" />
        </g>
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontWeight="700"
          fontSize="17"
          fill="#f5c842"
        >
          S
        </text>
      </svg>
    ),
    { ...size }
  );
}
