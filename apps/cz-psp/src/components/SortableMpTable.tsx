"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PartyFace, CZ_PSP_PARTY_META } from "@legislature/ui";
import type { MpProfile } from "@/lib/types";

type SortKey = "name" | "party" | "attendance" | "rebelity" | "govity" | "corrections";
type SortDir = "asc" | "desc";

function pct(v: number, decimals = 1) {
  return `${(v * 100).toFixed(decimals)}\u00a0%`;
}

function getNumericValue(mp: MpProfile, key: SortKey): number {
  switch (key) {
    case "attendance":  return mp.attendance?.present_share ?? -1;
    case "rebelity":    return mp.rebelity?.rebelity ?? -1;
    case "govity":      return mp.govity?.govity ?? -1;
    case "corrections": return mp.voteCorrections?.corrections_total ?? -1;
    default:            return 0;
  }
}

function sortMps(mps: MpProfile[], key: SortKey, dir: SortDir): MpProfile[] {
  return [...mps].sort((a, b) => {
    let cmp: number;
    if (key === "name") {
      cmp = a.familyName.localeCompare(b.familyName, "cs") ||
            a.givenName.localeCompare(b.givenName, "cs");
    } else if (key === "party") {
      const aName = CZ_PSP_PARTY_META[a.partyId ?? ""]?.shortName ?? a.groupName ?? "";
      const bName = CZ_PSP_PARTY_META[b.partyId ?? ""]?.shortName ?? b.groupName ?? "";
      cmp = aName.localeCompare(bName, "cs") ||
            a.familyName.localeCompare(b.familyName, "cs");
    } else {
      cmp = getNumericValue(a, key) - getNumericValue(b, key);
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

// ─── Sort arrows ──────────────────────────────────────────────────────────────

interface SortArrowsProps {
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (key: SortKey, dir: SortDir) => void;
}

function SortArrows({ sortKey, current, dir, onSort }: SortArrowsProps) {
  const isActive = current === sortKey;
  return (
    <span className="inline-flex flex-col ml-1 leading-none gap-px align-middle">
      <button
        onClick={() => onSort(sortKey, "asc")}
        className={`text-[9px] leading-none cursor-pointer transition-opacity ${isActive && dir === "asc" ? "opacity-100 text-foreground" : "opacity-30 hover:opacity-70"}`}
        aria-label={`Seřadit vzestupně`}
      >▲</button>
      <button
        onClick={() => onSort(sortKey, "desc")}
        className={`text-[9px] leading-none cursor-pointer transition-opacity ${isActive && dir === "desc" ? "opacity-100 text-foreground" : "opacity-30 hover:opacity-70"}`}
        aria-label={`Seřadit sestupně`}
      >▼</button>
    </span>
  );
}

function Th({ label, sortKey, current, dir, onSort, className = "" }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (key: SortKey, dir: SortDir) => void; className?: string;
}) {
  return (
    <th className={`py-2 pr-4 font-semibold text-muted-foreground whitespace-nowrap ${className}`}>
      {label}
      <SortArrows sortKey={sortKey} current={current} dir={dir} onSort={onSort} />
    </th>
  );
}

// ─── Party filter ─────────────────────────────────────────────────────────────

interface PartyFilterProps {
  parties: Array<{ partyId: string; groupName: string }>;
  selected: string | null;
  onSelect: (partyId: string | null) => void;
}

function PartyFilter({ parties, selected, onSelect }: PartyFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`text-sm px-3 py-1 rounded-badge border transition-colors cursor-pointer ${
          selected === null
            ? "border-foreground bg-foreground text-surface-0 font-medium"
            : "border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        Všichni
      </button>
      {parties.map(({ partyId, groupName }) => (
        <button
          key={partyId}
          onClick={() => onSelect(partyId === selected ? null : partyId)}
          className={`cursor-pointer transition-opacity ${selected !== null && selected !== partyId ? "opacity-40" : "opacity-100"}`}
          title={groupName}
          aria-label={groupName}
        >
          <PartyFace partyId={partyId} size={28} />
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  mps: MpProfile[];
  defaultSort?: SortKey;
  defaultDir?: SortDir;
  showPartyFilter?: boolean;
}

export function SortableMpTable({ mps, defaultSort = "attendance", defaultDir = "desc", showPartyFilter = true }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>(defaultSort);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);
  const [partyFilter, setPartyFilter] = useState<string | null>(null);

  // Derive unique parties in appearance order (by memberCount desc, stable)
  const parties = useMemo(() => {
    const seen = new Map<string, string>();
    for (const mp of mps) {
      if (mp.partyId && !seen.has(mp.partyId)) {
        seen.set(mp.partyId, mp.groupName ?? mp.partyId);
      }
    }
    return Array.from(seen.entries())
      .map(([partyId, groupName]) => ({ partyId, groupName }))
      .sort((a, b) =>
        (CZ_PSP_PARTY_META[a.partyId]?.shortName ?? a.partyId).localeCompare(
          CZ_PSP_PARTY_META[b.partyId]?.shortName ?? b.partyId, "cs"
        )
      );
  }, [mps]);

  function handleSort(key: SortKey, dir: SortDir) {
    setSortKey(key);
    setSortDir(dir);
  }

  const filtered = partyFilter ? mps.filter((mp) => mp.partyId === partyFilter) : mps;
  const currentMps = sortMps(filtered.filter((mp) => mp.isCurrent), sortKey, sortDir);
  const formerMps = sortMps(filtered.filter((mp) => !mp.isCurrent), sortKey, sortDir);

  const colCount = 6;

  function MpRow({ mp }: { mp: MpProfile }) {
    return (
      <tr className="border-b border-border hover:bg-surface-2 transition-colors">
        <td className="py-2 pr-4">
          <Link href={`/poslanec/${mp.slug}`} className="font-medium hover:text-primary transition-colors">
            {mp.familyName} {mp.givenName}
          </Link>
        </td>
        <td className="py-2 pr-4">
          {mp.partyId && (
            <PartyFace partyId={mp.partyId} size={24} title={mp.groupName ?? mp.partyId} />
          )}
        </td>
        <td className="py-2 pr-4 text-right tabular-nums">
          {mp.attendance ? pct(mp.attendance.present_share) : "—"}
        </td>
        <td className="py-2 pr-4 text-right tabular-nums">
          {mp.rebelity != null ? pct(mp.rebelity.rebelity) : "—"}
        </td>
        <td className="py-2 pr-4 text-right tabular-nums">
          {mp.govity != null ? pct(mp.govity.govity) : "—"}
        </td>
        <td className="py-2 text-right tabular-nums">
          {mp.voteCorrections?.corrections_total ?? "—"}
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-4">
      {showPartyFilter && <PartyFilter parties={parties} selected={partyFilter} onSelect={setPartyFilter} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <Th label="Poslanec/kyně"    sortKey="name"        current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Strana"           sortKey="party"       current={sortKey} dir={sortDir} onSort={handleSort} />
              <Th label="Účast"             sortKey="attendance"  current={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
              <Th label="Rebelita"         sortKey="rebelity"    current={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
              <Th label="Vládnost"         sortKey="govity"      current={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
              <Th label="Opravy hlasování" sortKey="corrections" current={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
            </tr>
          </thead>
          <tbody>
            {currentMps.map((mp) => <MpRow key={mp.personId} mp={mp} />)}
          </tbody>
          {formerMps.length > 0 && (
            <>
              <tbody>
                <tr>
                  <td colSpan={colCount} className="pt-6 pb-2 text-sm font-semibold text-muted-foreground">
                    Bývalí poslanci
                  </td>
                </tr>
              </tbody>
              <tbody>
                {formerMps.map((mp) => <MpRow key={mp.personId} mp={mp} />)}
              </tbody>
            </>
          )}
        </table>
      </div>
    </div>
  );
}
