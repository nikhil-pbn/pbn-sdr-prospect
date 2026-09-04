import "server-only";
import { Prisma } from "@/server/db";
import { toNumber } from "./filters";

/**
 * The five measurements, written once.
 *
 * Every grouping — by prospect, by SDR, by day, and the overall
 * totals — has to compute these identically, or two sections of one dashboard
 * quietly disagree. Sharing the SQL fragment and the mapper is what makes that
 * impossible rather than merely unlikely.
 *
 * Cheap because a row already IS a visit: views and reading time arrive
 * pre-summed per visitor, so these are plain SUMs rather than a scan over every
 * heartbeat.
 */

/** Requires the visit table aliased as `e`. */
export const METRIC_COLUMNS = Prisma.sql`
  sum(e.views)                                              AS views,
  count(DISTINCT e.visitor_id)                              AS unique_views,
  sum(e.active_ms)                                          AS total_ms,
  count(*)                                                  AS sessions,
  sum(jsonb_array_length(coalesce(e.actions, '[]'::jsonb))) AS clicks
`;

/** Postgres SUMs come back null over an empty set, hence every column is nullable. */
export type MetricRow = {
  views: bigint | null;
  unique_views: bigint | null;
  total_ms: bigint | null;
  sessions: bigint | null;
  clicks: bigint | null;
};

export type Metrics = {
  views: number;
  uniqueViews: number;
  totalMs: number;
  /** Distinct visits — one per row. The divisor for average time. */
  sessions: number;
  averageMsPerSession: number;
  clicks: number;
};

export function toMetrics(row: MetricRow | undefined): Metrics {
  const totalMs = toNumber(row?.total_ms ?? null);
  const sessions = toNumber(row?.sessions ?? null);

  return {
    views: toNumber(row?.views ?? null),
    uniqueViews: toNumber(row?.unique_views ?? null),
    totalMs,
    sessions,
    // Guarded rather than trusted: dividing by zero visits is the single most
    // likely source of "NaN" on an empty dashboard.
    averageMsPerSession: sessions > 0 ? Math.round(totalMs / sessions) : 0,
    clicks: toNumber(row?.clicks ?? null),
  };
}
