import "server-only";
import { prisma, Prisma, ProspectStatus } from "@/server/db";
import { eventWhere, toNumber, type AnalyticsFilters } from "./filters";
import {
  METRIC_COLUMNS,
  toMetrics,
  type MetricRow,
  type Metrics,
} from "./metrics";

/**
 * The six headline numbers, in a single pass over the events.
 *
 * One query rather than six: the table is scanned once and every card is
 * guaranteed to describe the same set of rows. Six separate counts could each
 * be individually correct and still disagree, because events keep arriving
 * while they run.
 */

export type AnalyticsSummary = Metrics & {
  /**
   * Prospects with at least one visit in the range — the agreed rule. NOT the
   * number of prospects that exist: a row reading "Views 0, Prospects 12" reads
   * as a bug, and every other number on the page is range-scoped too.
   */
  prospectsWithActivity: number;
  /** Every published prospect, ignoring the range, for context under the card. */
  publishedProspects: number;
};

type Row = MetricRow & { prospects: bigint };

export async function analyticsSummary(
  filters: AnalyticsFilters,
): Promise<AnalyticsSummary> {
  const where = eventWhere(filters);

  const [row] = await prisma.$queryRaw<Row[]>(Prisma.sql`
    SELECT
      count(DISTINCT e.prospect_id) AS prospects,
      ${METRIC_COLUMNS}
    FROM prospect_analytics_events e
    ${where}
  `);

  // Not range-scoped on purpose: "12 of 39 published" is the useful sentence,
  // and the 39 does not depend on which dates are selected.
  const publishedProspects = await prisma.prospect.count({
    where: { status: ProspectStatus.Published },
  });

  return {
    prospectsWithActivity: toNumber(row?.prospects ?? null),
    publishedProspects,
    ...toMetrics(row),
  };
}
