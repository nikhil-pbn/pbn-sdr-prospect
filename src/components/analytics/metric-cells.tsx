import { TableCell } from "@/components/ui/table";
import type { HeadColumn } from "@/components/table-head-row";
import { formatDuration } from "@/utils/duration";
import type { Metrics } from "@/server/analytics/queries";

/**
 * The five measurement columns, shared by every breakdown table.
 *
 * One declaration for the headers and one component for the cells, so the SDR,
 * date and prospect tables cannot drift into different column orders,
 * alignments or duration formats. Right-aligned and tabular so the digits line
 * up down the column.
 *
 * The keys match `METRIC_SORT`, which is what lets all three tables sort by the
 * same five measurements.
 */
export const METRIC_HEAD: HeadColumn[] = [
  { key: "views", label: "Views", align: "right" },
  { key: "unique", label: "Unique", align: "right" },
  { key: "time", label: "Time spent", align: "right" },
  { key: "avg", label: "Avg / visit", align: "right" },
  { key: "clicks", label: "Clicks", align: "right" },
];

export function MetricCells({ metrics }: { metrics: Metrics }) {
  return (
    <>
      <TableCell className="text-right tabular-nums">{metrics.views}</TableCell>
      <TableCell className="text-right tabular-nums text-muted-foreground">
        {metrics.uniqueViews}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatDuration(metrics.totalMs)}
      </TableCell>
      <TableCell className="text-right tabular-nums text-muted-foreground">
        {formatDuration(metrics.averageMsPerSession)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {metrics.clicks}
      </TableCell>
    </>
  );
}

/** Shown in place of a table when a range holds no activity at all. */
export function NoActivity({ what }: { what: string }) {
  return (
    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      No {what} activity in this date range.
    </p>
  );
}
