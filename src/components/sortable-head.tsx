import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { nextSort, type Sort, type SortColumns } from "@/utils/table-sort";

/**
 * A column header you can click to sort by.
 *
 * A Server Component built from a link, with no client JavaScript — the same
 * shape as `TablePagination`, and for the same reason: sorting is a navigation,
 * so the ORDER BY runs in Postgres and only the rows being shown cross the
 * wire. A client-side sort would have to hold every row in the browser to be
 * correct, which is what pagination exists to avoid.
 *
 * The link deliberately does NOT carry `page`. Re-sorting a table and staying
 * on page 4 shows the fourth 25 rows of a completely different ordering, which
 * reads as a bug even though every row is real.
 */
export function SortableHead({
  column,
  columns,
  sort,
  basePath,
  query,
  align = "left",
  className,
  children,
}: {
  /** This column's key — must exist in `columns`. */
  column: string;
  /** The whole table's sortable columns, so a first click knows which way to go. */
  columns: SortColumns;
  /** What the table is sorted by right now. */
  sort: Sort;
  /** Path without a query string, e.g. "/my-prospects". */
  basePath: string;
  /** Everything else that has to survive the click. */
  query?: Record<string, string>;
  /** Right for numbers, so the arrow sits beside the digits rather than the label. */
  align?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  const active = sort.key === column;
  const target = nextSort(column, columns, sort);

  const params = new URLSearchParams(query);
  params.set("sort", target.key);
  params.set("dir", target.dir);

  // Active shows which way it went; inactive shows that it CAN be sorted, which
  // is the only affordance a header link has.
  const Icon = active
    ? sort.dir === "asc"
      ? ArrowUp
      : ArrowDown
    : ChevronsUpDown;

  return (
    <TableHead
      className={cn(align === "right" && "text-right", className)}
      // What screen readers announce. `none` on the others is required by the
      // spec: it marks a column as sortable but not currently sorted.
      aria-sort={
        active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <Link
        href={`${basePath}?${params}`}
        // Keeps the viewport where it is. Clicking a header 400px down a long
        // table and being thrown back to the top loses the row you were reading.
        scroll={false}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          // Reversed so the arrow lands on the outside of a right-aligned column.
          align === "right" && "flex-row-reverse",
          !active && "text-muted-foreground",
        )}
      >
        {children}
        <Icon
          className={cn("size-3.5 shrink-0", !active && "opacity-50")}
          aria-hidden
        />
      </Link>
    </TableHead>
  );
}
