import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TableHeadRow, type HeadColumn } from "@/components/table-head-row";
import { MetricCells, METRIC_HEAD } from "./metric-cells";
import { relativeDate } from "@/utils/date";
import { prospectPathFor, prospectUrlFor } from "@/utils/prospect-url";
import { sdrByEmail } from "@/utils/sdr-roster";
import { ANALYTICS_SORT } from "@/utils/analytics-sort";
import type { Sort } from "@/utils/table-sort";
import type { ProspectAnalyticsRow } from "@/server/analytics/queries";

/** Exported for the dashboard's loading skeleton, which draws the same header. */
export const PROSPECT_ANALYTICS_COLUMNS: HeadColumn[] = [
  {
    key: "prospect",
    label: "Prospect",
    className: "min-w-48",
    skeleton: "stacked",
  },
  { key: "role", label: "Role", className: "min-w-32" },
  { key: "sdr", label: "SDR", className: "min-w-32" },
  ...METRIC_HEAD,
  { key: "lastViewed", label: "Last viewed", className: "min-w-36" },
];

/** The roster name where we have one, else the stored session name, else the address. */
function sdrName(row: ProspectAnalyticsRow): string {
  return sdrByEmail(row.ownerEmail)?.name || row.ownerName || row.ownerEmail;
}

/**
 * Engagement per prospect, busiest first.
 *
 * Only prospects with activity in the selected range are here — a table padded
 * with zeroes for everything nobody opened would bury the rows worth reading.
 * The empty state says so, because "no rows" and "no prospects" are different.
 */
export function ProspectAnalyticsTable({
  rows,
  sort,
  query,
}: {
  rows: ProspectAnalyticsRow[];
  sort: Sort;
  /** The date range and the active breakdown, so a sort click keeps both. */
  query: Record<string, string>;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No analytics data for this date range. Either nothing was opened, or no
        prospect page has been shared yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeadRow
          columns={PROSPECT_ANALYTICS_COLUMNS}
          sortable={ANALYTICS_SORT.prospects}
          sort={sort}
          basePath="/analytics"
          query={query}
        />
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                {/* The name leads to this prospect's own analytics, which is
                    what someone scanning this table wants next. The live page
                    stays a separate small icon. */}
                <span className="inline-flex items-center gap-1.5">
                  <Link
                    href={`/analytics/${row.id}`}
                    className="hover:underline"
                  >
                    {row.name}
                  </Link>
                  <Link
                    href={prospectPathFor(row.slug)}
                    target="_blank"
                    prefetch={false}
                    title={prospectUrlFor(row.slug)}
                    aria-label={`Open the live page for ${row.name}`}
                  >
                    <ExternalLink
                      className="size-3 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </Link>
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {row.email}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.prospectRole || "—"}
              </TableCell>
              <TableCell title={row.ownerEmail}>{sdrName(row)}</TableCell>
              <MetricCells metrics={row} />
              <TableCell className="text-muted-foreground">
                {row.lastViewedAt ? relativeDate(row.lastViewedAt) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
