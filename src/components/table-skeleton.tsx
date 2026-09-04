import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TableHeadRow, type HeadColumn } from "./table-head-row";
import type { Sort, SortColumns } from "@/utils/table-sort";

/**
 * What a listing table looks like while its rows are still being queried.
 *
 * The real header over grey rows in the real columns, rather than a line of
 * "Loading…": the table appears where the table will be, at roughly the size
 * it will be, and the rows fill in beneath headers that never move. A sentence
 * in the corner leaves a blank page and then drops a table onto it.
 *
 * Built from the same `HeadColumn` spec the loaded table renders from, so a
 * column added to a table appears in its skeleton without a second edit — and
 * from the same `TableHeadRow`, so the sort arrows are already right while the
 * rows load, and clicking one works.
 */

/** Enough rows to read as a table, few enough not to read as a wall. */
export const SKELETON_ROWS = 8;

export function TableSkeleton({
  columns,
  rows = SKELETON_ROWS,
  sort,
  label = "rows",
  className,
}: {
  columns: HeadColumn[];
  rows?: number;
  /**
   * The page's sort state, when it has one. With it, the header is the same
   * sortable `TableHeadRow` the loaded table renders — so it neither changes
   * nor moves when the rows arrive. Without it, plain labels.
   */
  sort?: {
    sortable: SortColumns;
    sort: Sort;
    basePath: string;
    query?: Record<string, string>;
  };
  /** Plural noun for the screen-reader announcement: "Loading prospects". */
  label?: string;
  /** For the frame: the listing tables sit on `bg-card`, the analytics ones do not. */
  className?: string;
}) {
  return (
    <div
      className={cn("overflow-x-auto rounded-xl border", className)}
      aria-busy="true"
    >
      <p role="status" className="sr-only">
        Loading {label}…
      </p>
      <Table>
        {sort ? (
          <TableHeadRow columns={columns} {...sort} />
        ) : (
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((column) => (
                <TableHead
                  key={column.label}
                  className={cn(
                    column.align === "right" && "text-right",
                    column.className,
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }, (_, row) => (
            // No hover tint: a highlighted row of grey bars invites a click
            // on nothing.
            <TableRow key={row} className="hover:bg-transparent">
              {columns.map((column, col) => (
                <TableCell key={column.label}>
                  <CellSkeleton column={column} seed={row + col} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Widths vary down a column so the rows read as rows of different values
 * rather than one repeated stripe. Chosen from the row and column, never at
 * random: a server-rendered fallback must produce the same markup on the
 * client, or React reports a hydration mismatch.
 *
 * Fixed widths, not fractions of the cell. In an auto-layout table a
 * percentage-wide child contributes nothing to the column's intrinsic width,
 * and the column collapses under it.
 */
const TEXT_WIDTHS = ["w-28", "w-20", "w-24", "w-32"];
const NUMBER_WIDTHS = ["w-8", "w-12", "w-10"];

/**
 * One cell's placeholder, in the shape the column's values take.
 *
 * Heights match the text they stand in for — a `text-sm` line is 20px, a
 * `text-xs` line 16px — so a row of placeholders is as tall as a row of
 * values and the table does not jump when they arrive.
 */
function CellSkeleton({ column, seed }: { column: HeadColumn; seed: number }) {
  const shape = column.skeleton ?? "text";
  const right = column.align === "right";

  if (shape === "badge") {
    return (
      <Skeleton className={cn("h-5 w-16 rounded-full", right && "ml-auto")} />
    );
  }

  if (shape === "buttons") {
    return (
      <div className={cn("flex gap-1.5", right && "justify-end")}>
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    );
  }

  if (shape === "stacked") {
    return (
      <>
        <Skeleton
          className={cn("my-0.5 h-4", TEXT_WIDTHS[seed % TEXT_WIDTHS.length])}
        />
        <Skeleton
          className={cn(
            "my-0.5 h-3 bg-muted/70",
            TEXT_WIDTHS[(seed + 1) % TEXT_WIDTHS.length],
          )}
        />
      </>
    );
  }

  if (right) {
    return (
      <Skeleton
        className={cn(
          "my-0.5 ml-auto h-4",
          NUMBER_WIDTHS[seed % NUMBER_WIDTHS.length],
        )}
      />
    );
  }

  return (
    <Skeleton
      className={cn("my-0.5 h-4", TEXT_WIDTHS[seed % TEXT_WIDTHS.length])}
    />
  );
}
