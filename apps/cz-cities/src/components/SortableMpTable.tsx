"use client";

// Local, full fork of @legislature/ui's SortableMpTable — owner review fix
// (2026-08-05, DIVERGENCE.md §6/§7).
//
// This used to be a thin wrapper around the upstream component (see git
// history), only injecting `getMpHref`. That's no longer viable: upstream
// SortableMpTable imports `PartyFace` and `CZ_PSP_PARTY_META` directly from
// "@legislature/ui" with no prop to override the party dictionary — it
// can't recognize this app's real Praha candidate-list slugs
// (e.g. "starostove-a-nezavisli"), so party badges on /praha/members
// rendered as illegibly truncated raw IDs ("ANO-201…", "RATSKA" — the
// owner's screenshot finding). packages/ui is read-only for this task, so
// the fix is this full local fork: same UI/behavior (sorting, party filter,
// current/former split, columns prop), but using this app's own
// `PARTY_META`/`PARTY_COLORS` (src/lib/parties.ts) and the local
// `PartyFace` (src/components/PartyFace.tsx) — the same lookup the
// front-page charts and vote-event page already used, so badges are now
// visually identical everywhere (same colors, same short abbreviations).
//
// Server Components can't pass function props across the RSC server/client
// boundary (functions aren't serializable), which is why `getMpHref` is
// still built from a plain, serializable `basePath` string here, on the
// client side of the boundary — this part is unchanged from the previous
// wrapper (see A2 commit history for the exact build error this avoids).
import { useState, useMemo } from "react";
import type { MpProfile, ParliamentTranslations } from "@legislature/parliament-core";
import { PartyFace } from "./PartyFace";
import { PARTY_META } from "@/lib/parties";

// "corrections" (vote corrections) removed (2026-08-05, DIVERGENCE.md §8
// (c)): cities don't record vote corrections — it's a Sněmovna-only
// statistic that leaked in from copying apps/cz-psp's table component (see
// data.ts's `voteCorrections` field, hardcoded to `null` for every city MP
// profile). This local fork's `SortKey`/`MetricColumn` union types
// deliberately no longer include "corrections" at all — narrower than
// upstream `@legislature/ui`'s SortableMpTable (packages/*, read-only),
// which still has it for cz-psp/sk-nrsr.
type SortKey = "name" | "party" | "attendance" | "rebelity" | "govity";
type SortDir = "asc" | "desc";
type MetricColumn = "attendance" | "rebelity" | "govity";

const ALL_METRIC_COLUMNS: MetricColumn[] = ["attendance", "rebelity", "govity"];

function pct(v: number, decimals = 1) {
  return `${(v * 100).toFixed(decimals)} %`;
}

function getNumericValue(mp: MpProfile, key: SortKey): number {
  switch (key) {
    case "attendance":  return mp.attendance?.present_share ?? -1;
    case "rebelity":    return mp.rebelity?.rebelity ?? -1;
    case "govity":      return mp.govity?.govity ?? -1;
    default:            return 0;
  }
}

function sortMps(mps: MpProfile[], key: SortKey, dir: SortDir, lang: string): MpProfile[] {
  return [...mps].sort((a, b) => {
    let cmp: number;
    if (key === "name") {
      cmp = a.familyName.localeCompare(b.familyName, lang) ||
            a.givenName.localeCompare(b.givenName, lang);
    } else if (key === "party") {
      const aName = PARTY_META[a.partyId ?? ""]?.shortName ?? a.groupName ?? "";
      const bName = PARTY_META[b.partyId ?? ""]?.shortName ?? b.groupName ?? "";
      cmp = aName.localeCompare(bName, lang) ||
            a.familyName.localeCompare(b.familyName, lang);
    } else {
      cmp = getNumericValue(a, key) - getNumericValue(b, key);
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

// ─── Sort arrows ──────────────────────────────────────────────────────────────

function SortArrows({ sortKey, current, dir, onSort, sortAsc, sortDesc }: {
  sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (key: SortKey, dir: SortDir) => void;
  sortAsc: string; sortDesc: string;
}) {
  const isActive = current === sortKey;
  return (
    <span className="inline-flex flex-col ml-1 leading-none gap-px align-middle">
      <button
        onClick={() => onSort(sortKey, "asc")}
        className={`text-[9px] leading-none cursor-pointer transition-opacity ${isActive && dir === "asc" ? "opacity-100 text-foreground" : "opacity-30 hover:opacity-70"}`}
        aria-label={sortAsc}
      >▲</button>
      <button
        onClick={() => onSort(sortKey, "desc")}
        className={`text-[9px] leading-none cursor-pointer transition-opacity ${isActive && dir === "desc" ? "opacity-100 text-foreground" : "opacity-30 hover:opacity-70"}`}
        aria-label={sortDesc}
      >▼</button>
    </span>
  );
}

function Th({ label, sortKey, current, dir, onSort, sortAsc, sortDesc, className = "" }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (key: SortKey, dir: SortDir) => void;
  sortAsc: string; sortDesc: string; className?: string;
}) {
  return (
    <th className={`py-2 pr-4 font-semibold text-muted-foreground whitespace-nowrap ${className}`}>
      {label}
      <SortArrows sortKey={sortKey} current={current} dir={dir} onSort={onSort} sortAsc={sortAsc} sortDesc={sortDesc} />
    </th>
  );
}

// ─── Party filter ─────────────────────────────────────────────────────────────

function PartyFilter({ parties, selected, onSelect, allLabel }: {
  parties: Array<{ partyId: string; groupName: string }>;
  selected: string | null;
  onSelect: (partyId: string | null) => void;
  allLabel: string;
}) {
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
        {allLabel}
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

export interface SortableMpTableProps {
  mps: MpProfile[];
  lang: string;
  labels: ParliamentTranslations["table"];
  defaultSort?: SortKey;
  defaultDir?: SortDir;
  showPartyFilter?: boolean;
  formerLabel?: string;
  /**
   * Which metric columns to show. Typed against the wider, shared
   * `MemberTableBlockConfig["columns"]` (packages/parliament-core,
   * read-only — still includes "corrections" for cz-psp/sk-nrsr) for prop
   * compatibility with `PageBlockRenderer`'s `tc.columns` pass-through, but
   * "corrections" is always filtered out below — this app never renders a
   * vote-corrections column (2026-08-05, DIVERGENCE.md §8 (c)).
   */
  columns?: Array<"attendance" | "rebelity" | "govity" | "corrections">;
  /** City base path, e.g. "/praha" or "/en/praha". */
  basePath: string;
}

export function SortableMpTable({
  mps,
  lang,
  labels,
  defaultSort = "attendance",
  defaultDir = "desc",
  showPartyFilter = true,
  formerLabel,
  columns,
  basePath,
}: SortableMpTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>(defaultSort);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);
  const [partyFilter, setPartyFilter] = useState<string | null>(null);

  const getMpHref = (slug: string) => `${basePath}/member/${slug}`;
  const visibleCols: MetricColumn[] = columns
    ? columns.filter((c): c is MetricColumn => c !== "corrections")
    : ALL_METRIC_COLUMNS;

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
        (PARTY_META[a.partyId]?.shortName ?? a.partyId).localeCompare(
          PARTY_META[b.partyId]?.shortName ?? b.partyId, lang
        )
      );
  }, [mps, lang]);

  function handleSort(key: SortKey, dir: SortDir) {
    setSortKey(key);
    setSortDir(dir);
  }

  const filtered = partyFilter ? mps.filter((mp) => mp.partyId === partyFilter) : mps;
  const currentMps = sortMps(filtered.filter((mp) => mp.isCurrent), sortKey, sortDir, lang);
  const formerMps = sortMps(filtered.filter((mp) => !mp.isCurrent), sortKey, sortDir, lang);

  const colCount = 2 + visibleCols.length;

  const thProps = { current: sortKey, dir: sortDir, onSort: handleSort, sortAsc: labels.sortAsc, sortDesc: labels.sortDesc };

  function MpRow({ mp }: { mp: MpProfile }) {
    return (
      <tr className="border-b border-border hover:bg-surface-2 transition-colors">
        <td className="py-2 pr-4">
          <a href={getMpHref(mp.slug)} className="font-medium hover:text-primary transition-colors">
            {mp.familyName} {mp.givenName}
          </a>
        </td>
        <td className="py-2 pr-4">
          {mp.partyId && <PartyFace partyId={mp.partyId} size={24} title={mp.groupName ?? mp.partyId} />}
        </td>
        {visibleCols.includes("attendance") && (
          <td className="py-2 pr-4 text-right tabular-nums">
            {/* Praha reconciliation (2026-08-06): checking only that the
                `attendance`/`rebelity`/`govity` wrapper object exists isn't
                enough — attendance.py always returns a record (present_share
                simply omitted, i.e. undefined, when vote_events_total is 0),
                and rebelity.py/govity.py always return `{..., rebelity:
                null}` rather than omitting the record. The old `mp.attendance
                ? pct(...) : "—"` / `mp.rebelity != null ? pct(...) : "—"`
                checks were both truthy for a brand-new member with zero vote
                data, so `pct(undefined)` rendered "NaN %" and `pct(null)`
                rendered a misleading "0.0 %" (JS coerces `null * 100` to 0,
                not NaN) — neither is "no data yet". Check the actual numeric
                field instead. */}
            {mp.attendance && mp.attendance.present_share != null
              ? pct(mp.attendance.present_share)
              : "—"}
          </td>
        )}
        {visibleCols.includes("rebelity") && (
          <td className="py-2 pr-4 text-right tabular-nums">
            {mp.rebelity?.rebelity != null ? pct(mp.rebelity.rebelity) : "—"}
          </td>
        )}
        {visibleCols.includes("govity") && (
          <td className="py-2 text-right tabular-nums">
            {mp.govity?.govity != null ? pct(mp.govity.govity) : "—"}
          </td>
        )}
      </tr>
    );
  }

  return (
    <div className="space-y-4">
      {showPartyFilter && (
        <PartyFilter parties={parties} selected={partyFilter} onSelect={setPartyFilter} allLabel={labels.allFilter} />
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <Th label={labels.name}        sortKey="name"        {...thProps} />
              <Th label={labels.party}       sortKey="party"       {...thProps} />
              {visibleCols.includes("attendance")  && <Th label={labels.attendance}  sortKey="attendance"  {...thProps} className="text-right" />}
              {visibleCols.includes("rebelity")    && <Th label={labels.rebelity}    sortKey="rebelity"    {...thProps} className="text-right" />}
              {visibleCols.includes("govity")      && <Th label={labels.govity}      sortKey="govity"      {...thProps} className="text-right" />}
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
                    {formerLabel}
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
