import { CZ_PSP_PARTY_COLORS, CZ_PSP_PARTY_META } from "./PartyBadge";

// Square with 3 rounded corners (top-right sharp) — same shape used in charts
const FACE_PATH =
  "M 11.29 0 Q 0 0 0 11.29 L 0 18.71 Q 0 30 11.29 30 L 18.71 30 Q 30 30 30 18.71 L 30 0 L 11.29 0 Z";

// Font size mirroring PartyFaceBase formula: 9 * (size/42)^0.25
function faceFontSize(size: number) {
  return 9 * Math.pow(size / 42, 0.25);
}

export interface PartyFaceProps {
  /** Party ID matching CZ_PSP_PARTY_META keys (e.g. "ano", "spd") */
  partyId: string;
  /** Width and height in px. Default 24. */
  size?: number;
  className?: string;
  title?: string;
}

export function PartyFace({ partyId, size = 24, className, title }: PartyFaceProps) {
  const meta = CZ_PSP_PARTY_META[partyId];
  const color = CZ_PSP_PARTY_COLORS[partyId] ?? "#bcbcb0";
  const abbr = meta?.faceAbbr ?? partyId.toUpperCase();
  const textColor = meta?.darkText ? "#1a1a1a" : "#ffffff";
  const scale = size / 30;
  const fontSize = faceFontSize(size);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
      className={className}
      aria-label={title ?? meta?.shortName ?? partyId}
    >
      <path d={FACE_PATH} fill={color} transform={`scale(${scale / scale})`} />
      <text
        x="15"
        y="18"
        fontFamily="'Roboto Slab', serif"
        fontSize={fontSize}
        fontWeight="700"
        fill={textColor}
        textAnchor="middle"
      >
        {abbr}
      </text>
    </svg>
  );
}
