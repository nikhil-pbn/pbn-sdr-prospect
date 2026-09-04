import "server-only";
import { Prisma } from "@/server/db";
import type { Sort } from "@/utils/table-sort";

/**
 * ORDER BY for the four breakdowns.
 *
 * These queries are raw SQL, so this is the file where a mistake would be an
 * injection rather than a wrong sort. Two rules make that impossible instead of
 * unlikely: the column comes from a lookup table keyed by a value `parseSort`
 * already checked against the same whitelist, and the direction is one of
 * exactly two `Prisma.raw` constants. Nothing from the request is ever
 * interpolated as text.
 */

/** The measurement columns, shared by all four breakdowns. */
export const METRIC_ORDER: Record<string, Prisma.Sql> = {
  // Output aliases from METRIC_COLUMNS. Postgres resolves a bare name in ORDER
  // BY as an output column first, so these order by the aggregate.
  views: Prisma.sql`views`,
  unique: Prisma.sql`unique_views`,
  time: Prisma.sql`total_ms`,
  // The one with no alias to borrow: the average is divided in JavaScript from
  // the total and the visit count, so ordering by it needs the division written
  // out. NULLIF guards the zero-visit case the mapper guards for NaN.
  avg: Prisma.sql`sum(e.active_ms) / NULLIF(count(*), 0)`,
  clicks: Prisma.sql`clicks`,
  prospects: Prisma.sql`prospects`,
};

const ASC = Prisma.raw("ASC");
const DESC = Prisma.raw("DESC");

/**
 * Builds the clause.
 *
 * `tiebreak` must be unique per output row. Views tie constantly, and with
 * LIMIT/OFFSET over an ambiguous order a tied row can appear on two pages while
 * another appears on none.
 *
 * NULLS LAST always, in both directions. Postgres defaults to nulls first on
 * DESC, which would open "Last viewed, newest first" with every prospect nobody
 * has opened.
 */
export function analyticsOrderBy(
  sort: Sort,
  columns: Record<string, Prisma.Sql>,
  tiebreak: Prisma.Sql,
): Prisma.Sql {
  const column = columns[sort.key] ?? METRIC_ORDER.views;
  const direction = sort.dir === "asc" ? ASC : DESC;

  if (column === tiebreak) {
    return Prisma.sql`ORDER BY ${column} ${direction} NULLS LAST`;
  }

  return Prisma.sql`ORDER BY ${column} ${direction} NULLS LAST, ${tiebreak} ASC`;
}
