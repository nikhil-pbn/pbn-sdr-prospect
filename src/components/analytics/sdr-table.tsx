import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TableHeadRow, type HeadColumn } from "@/components/table-head-row";
import { sdrByEmail } from "@/utils/sdr-roster";
import { ANALYTICS_SORT } from "@/utils/analytics-sort";
import type { Sort } from "@/utils/table-sort";
import { MetricCells, METRIC_HEAD, NoActivity } from "./metric-cells";
import type { SdrAnalyticsRow } from "@/server/analytics/queries";

/** Exported for the dashboard's loading skeleton, which draws the same header. */
export const SDR_ANALYTICS_COLUMNS: HeadColumn[] = [
  // Orders by the address the rows are grouped on, not the roster name rendered
  // in the cell — that name is resolved at render time and is not a column.
  { key: "sdr", label: "SDR", className: "min-w-40" },
  { key: "prospects", label: "Prospects", align: "right" },
  ...METRIC_HEAD,
];

/**
 * Engagement per SDR.
 *
 * Grouped in SQL by `owner_email` — which comes from the Google session and
 * cannot drift — and named here from the roster, falling back to the stored
 * session name and finally to the address itself.
 */
export function SdrAnalyticsTable({
  rows,
  sort,
  query,
}: {
  rows: SdrAnalyticsRow[];
  sort: Sort;
  /** The date range and the active breakdown, so a sort click keeps both. */
  query: Record<string, string>;
}) {
  if (rows.length === 0) return <NoActivity what="SDR" />;

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeadRow
          columns={SDR_ANALYTICS_COLUMNS}
          sortable={ANALYTICS_SORT.sdr}
          sort={sort}
          basePath="/analytics"
          query={query}
        />
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.ownerEmail}>
              <TableCell className="font-medium" title={row.ownerEmail}>
                {sdrByEmail(row.ownerEmail)?.name ||
                  row.sdrName ||
                  row.ownerEmail}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {row.prospects}
              </TableCell>
              <MetricCells metrics={row} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
