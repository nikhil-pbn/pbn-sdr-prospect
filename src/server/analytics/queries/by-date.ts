import "server-only";
import { prisma, Prisma } from "@/server/db";
import { ANALYTICS_TIMEZONE } from "@/utils/ist";
import type { Bucket } from "@/utils/date-bucket";
import { ANALYTICS_SORT_DEFAULT } from "@/utils/analytics-sort";
import type { Sort } from "@/utils/table-sort";
import { eventWhere, toNumber, type AnalyticsFilters } from "./filters";
import {
  METRIC_COLUMNS,
  toMetrics,
  type MetricRow,
  type Metrics,
} from "./metrics";
import { analyticsOrderBy, METRIC_ORDER } from "./order-by";

/**
 * Engagement over time, one row per day, week or month.
 *
 * Bucketed with `AT TIME ZONE` so the boundaries are IST civil days — the same
 * boundaries the presets use. `date_trunc('week', …)` in Postgres starts weeks
 * on MONDAY, which is what the presets do too, so "This week" and the weekly
 * rows agree by construction.
 *
 * Not paginated: the bucket widens as the range grows (see `bucketFor`), so the
 * row count stays bounded.
 */

export type DateAnalyticsRow = Metrics & {
  /** Start of the bucket, as an instant. Labelled by `bucketLabel`. */
  start: Date;
  /** Prospects opened in this bucket — the agreed counting rule. */
  prospects: number;
};

type Row = MetricRow & {
  bucket_start: Date;
  prospects: bigint;
};

/** One row per bucket, so this both names the date column and settles every tie. */
const BUCKET = Prisma.sql`bucket_start`;

const COLUMNS: Record<string, Prisma.Sql> = { ...METRIC_ORDER, bucket: BUCKET };

export async function dateAnalytics(
  filters: AnalyticsFilters & { bucket: Bucket; sort?: Sort },
): Promise<DateAnalyticsRow[]> {
  const order = analyticsOrderBy(
    filters.sort ?? ANALYTICS_SORT_DEFAULT.date,
    COLUMNS,
    BUCKET,
  );

  // Interpolated as raw SQL, not a parameter: `date_trunc` takes its unit as a
  // literal. Safe because `bucket` is a union of three known strings, never input.
  const unit = Prisma.raw(`'${filters.bucket}'`);

  const rows = await prisma.$queryRaw<Row[]>(Prisma.sql`
    SELECT
      date_trunc(${unit}, e.created_at AT TIME ZONE ${ANALYTICS_TIMEZONE})
        AT TIME ZONE ${ANALYTICS_TIMEZONE} AS bucket_start,
      count(DISTINCT e.prospect_id) AS prospects,
      ${METRIC_COLUMNS}
    FROM prospect_analytics_events e
    ${eventWhere(filters)}
    GROUP BY bucket_start
    ${order}
  `);

  return rows.map((row) => ({
    start: row.bucket_start,
    prospects: toNumber(row.prospects),
    ...toMetrics(row),
  }));
}
