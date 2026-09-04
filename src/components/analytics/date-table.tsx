import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TableHeadRow, type HeadColumn } from "@/components/table-head-row";
import { bucketLabel, type Bucket } from "@/utils/date-bucket";
import { ANALYTICS_SORT } from "@/utils/analytics-sort";
import type { Sort } from "@/utils/table-sort";
import { MetricCells, METRIC_HEAD, NoActivity } from "./metric-cells";
import type { DateAnalyticsRow } from "@/server/analytics/queries";

const BUCKET_LABELS: Record<Bucket, string> = {
  day: "Date",
  week: "Week",
  month: "Month",
};

/**
 * Built per bucket rather than as a module constant: the first column is named
 * after the grain, which the selected range decides. Exported so the loading
 * skeleton can draw the same header — including the right first label, since
 * the grain follows from the range alone and needs no query.
 */
export function dateColumns(bucket: Bucket): HeadColumn[] {
  return [
    { key: "bucket", label: BUCKET_LABELS[bucket], className: "min-w-36" },
    { key: "prospects", label: "Prospects", align: "right" },
    ...METRIC_HEAD,
  ];
}

/**
 * Engagement over time, newest first.
 *
 * Rows are IST days, weeks or months depending on how wide the selected range
 * is. Buckets with no activity are simply absent rather than padded with
 * zeroes: the table answers "when did people read".
 */
export function DateAnalyticsTable({
  rows,
  bucket,
  sort,
  query,
}: {
  rows: DateAnalyticsRow[];
  bucket: Bucket;
  sort: Sort;
  /** The date range and the active breakdown, so a sort click keeps both. */
  query: Record<string, string>;
}) {
  if (rows.length === 0) return <NoActivity what="reading" />;

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeadRow
          columns={dateColumns(bucket)}
          sortable={ANALYTICS_SORT.date}
          sort={sort}
          basePath="/analytics"
          query={query}
        />
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.start.toISOString()}>
              <TableCell className="font-medium">
                {bucketLabel(row.start, bucket)}
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
