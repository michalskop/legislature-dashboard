// Local PartyFace — owner review fix (2026-08-05, DIVERGENCE.md §6/§7).
//
// @legislature/ui's PartyFace (packages/ui/src/components/PartyFace.tsx,
// read-only for this task) hardcodes CZ_PSP_PARTY_META/CZ_PSP_PARTY_COLORS
// and SK_NRSR_PARTY_META/SK_NRSR_PARTY_COLORS — it doesn't recognize this
// app's real Praha candidate-list slugs (e.g. "starostove-a-nezavisli") and
// falls back to `partyId.toUpperCase()` rendered inside a fixed-size SVG
// face, which is how the owner's screenshot showed illegibly truncated
// names like "ANO-201…"/"RATSKA" on /praha/members, /praha/group/[id],
// /praha/groups, and /praha/member/[id] — every page that imported
// `PartyFace` from "@legislature/ui" directly.
//
// This is a visual/prop-compatible fork of that component (same FACE_PATH
// SVG shape, same font-size formula, same props) but reading from this
// app's own `PARTY_META`/`PARTY_COLORS` (src/lib/parties.ts) instead — the
// same lookup the front-page swarm/scatter charts and the vote-event page's
// buildGroups() already used, so badges are now visually identical (same
// colors, same short abbreviations) everywhere in the app, not just in
// charts. See SortableMpTable.tsx for the equivalent fork of the table
// component (which also hardcodes PartyFace internally and can't take a
// custom party dictionary via props).
import { PARTY_META, PARTY_COLORS } from "@/lib/parties";

const FACE_PATH =
  "M 11.29 0 Q 0 0 0 11.29 L 0 18.71 Q 0 30 11.29 30 L 18.71 30 Q 30 30 30 18.71 L 30 0 L 11.29 0 Z";

function faceFontSize(size: number) {
  return 9 * Math.pow(size / 42, 0.25);
}

export interface PartyFaceProps {
  /** Party ID matching PARTY_META keys (e.g. "starostove-a-nezavisli") */
  partyId: string;
  /** Width and height in px. Default 24. */
  size?: number;
  className?: string;
  title?: string;
}

export function PartyFace({ partyId, size = 24, className, title }: PartyFaceProps) {
  const meta = PARTY_META[partyId];
  const color = PARTY_COLORS[partyId] ?? "#bcbcb0";
  const abbr = meta?.faceAbbr ?? partyId.toUpperCase();
  const textColor = meta?.darkText ? "#1a1a1a" : "#ffffff";
  const fontSize = Math.round(faceFontSize(size) * 1000) / 1000;

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
      <path d={FACE_PATH} fill={color} />
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
