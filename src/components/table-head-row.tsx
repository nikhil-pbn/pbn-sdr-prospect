import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SortableHead } from "./sortable-head";
import type { Sort, SortColumns } from "@/utils/table-sort";

/**
 * The header row for every table in the app, declared rather than written out.
 *
 * A spec per table and one renderer means a table says WHICH columns it has,
 * and nothing says how a header looks — so two tables cannot drift apart on
 * padding or alignment. It also puts the sortable/not decision in one visible
 * place: a column with no `key` renders as plain text, which is what the
 * action columns want.
 */

export type HeadColumn = {
  /**
   * The sort key, which must exist in the table's `SortColumns`.
   *
   * Omitted for the action columns — Links, Actions. They hold buttons, not
   * values, so there is nothing to put in order and a sort arrow on them would
   * be a control that does nothing when clicked.
   */
  key?: string;
  label: string;
  /** Usually a `min-w-*`, so a column does not collapse under a short value. */
  className?: string;
  /** Right for the action columns, matching the cells beneath them. */
  align?: "left" | "right";
  /**
   * What a cell in this column looks like while the rows are loading — see
   * `TableSkeleton`. A line of text unless said otherwise: two lines for a
   * value with detail beneath it, a pill for a status, a row of buttons for
   * the action columns.
   */
  skeleton?: "text" | "stacked" | "badge" | "buttons";
};

export function TableHeadRow({
  columns,
  sortable,
  sort,
  basePath,
  query,
}: {
  columns: HeadColumn[];
  /** Every key this table accepts — a first click reads the column's kind from it. */
  sortable: SortColumns;
  sort: Sort;
  basePath: string;
  /** Whatever else must survive a sort click. */
  query?: Record<string, string>;
}) {
  return (
    <TableHeader>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        {columns.map((column) =>
          column.key ? (
            <SortableHead
              // The label, not the key: an action column has no key, and labels
              // are unique within a table by definition.
              key={column.label}
              column={column.key}
              columns={sortable}
              sort={sort}
              basePath={basePath}
              query={query}
              align={column.align}
              className={column.className}
            >
              {column.label}
            </SortableHead>
          ) : (
            <TableHead
              key={column.label}
              className={cn(
                column.align === "right" && "text-right",
                column.className,
              )}
            >
              {column.label}
            </TableHead>
          ),
        )}
      </TableRow>
    </TableHeader>
  );
}
