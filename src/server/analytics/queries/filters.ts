import "server-only";
import { Prisma } from "@/server/db";
import type { DateRange } from "@/utils/date-range";

/**
 * The WHERE clause every analytics query shares.
 *
 * There is no staff filter here and there must not be one: signed-in requests
 * are refused at ingestion, so no internal row exists to exclude. That rule
 * lives at the door precisely so a query written months from now cannot forget
 * it.
 *
 * One builder rather than a clause per query, because the requirement that all
 * sections agree on the selected range is exactly the kind of thing that rots.
 *
 * The range is half-open — `>= from AND < to` — so no query needs an end-of-day
 * fudge and nothing is dropped at midnight. An All Time range contributes no
 * bounds at all rather than sentinel dates.
 */

export type AnalyticsFilters = {
  range: DateRange;
  /** Narrow to one prospect, for the per-prospect panels. */
  prospectId?: string;
};

/** Emits `WHERE ...`, always non-empty so callers never branch on it. */
export function eventWhere(filters: AnalyticsFilters): Prisma.Sql {
  const parts: Prisma.Sql[] = [Prisma.sql`TRUE`];

  if (filters.range.from) {
    parts.push(Prisma.sql`e.created_at >= ${filters.range.from}`);
  }
  if (filters.range.to) {
    parts.push(Prisma.sql`e.created_at < ${filters.range.to}`);
  }
  // Events outlive a removed prospect on purpose — there is no foreign key. The
  // cost is that events can point at an id no longer in `prospects`, and those
  // must count for nothing. Here rather than in each query's JOIN because three
  // of them aggregate events without joining `prospects` at all. `dp` and not
  // `p`, so it cannot shadow the alias the joining queries use.
  parts.push(Prisma.sql`EXISTS (
    SELECT 1 FROM prospects dp WHERE dp.id = e.prospect_id
  )`);

  if (filters.prospectId) {
    parts.push(Prisma.sql`e.prospect_id = ${filters.prospectId}::uuid`);
  }

  return Prisma.sql`WHERE ${Prisma.join(parts, " AND ")}`;
}

/**
 * Postgres returns `count()` and `sum()` as bigint, which Prisma hands back as a
 * JavaScript BigInt. Left alone it survives all the way to the browser and
 * throws "Do not know how to serialize a BigInt" when React tries to send it —
 * so every aggregate is narrowed here, once.
 */
export function toNumber(value: bigint | number | null): number {
  if (value === null) return 0;
  return typeof value === "bigint" ? Number(value) : value;
}
