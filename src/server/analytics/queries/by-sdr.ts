import "server-only";
import { prisma, Prisma } from "@/server/db";
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
 * Engagement per SDR.
 *
 * Grouped by `owner_email`, NOT by name. The email comes from the Google session
 * and cannot drift; `owner_name` is display text that the tracking dialog can
 * correct per prospect, so grouping on it could split one person into two rows.
 * The name is only for display, and the table resolves it from the roster.
 *
 * There is no users table to join — an SDR is an email on a prospect — so this
 * is the whole of the SDR relationship, and no new entity was invented for it.
 *
 * Not paginated: one row per SDR with activity, so its length is bounded by the
 * size of the team.
 */

export type SdrAnalyticsRow = Metrics & {
  ownerEmail: string;
  /** The most frequent spelling stored for this SDR, as a fallback for the roster. */
  sdrName: string;
  /** Prospects of theirs that were opened in this range — the agreed counting rule. */
  prospects: number;
};

type Row = MetricRow & {
  owner_email: string;
  sdr_name: string;
  prospects: bigint;
};

/**
 * The grouping key, doing double duty as the tiebreaker: one row per address, so
 * it is unique, and sorting "SDR" sorts by it for the same reason the SDR column
 * elsewhere does — the displayed name comes from the roster and is not a column.
 */
const SDR = Prisma.sql`owner_email`;

const COLUMNS: Record<string, Prisma.Sql> = { ...METRIC_ORDER, sdr: SDR };

export async function sdrAnalytics(
  filters: AnalyticsFilters & { sort?: Sort },
): Promise<SdrAnalyticsRow[]> {
  const order = analyticsOrderBy(
    filters.sort ?? ANALYTICS_SORT_DEFAULT.sdr,
    COLUMNS,
    SDR,
  );

  const rows = await prisma.$queryRaw<Row[]>(Prisma.sql`
    SELECT
      lower(p.owner_email) AS owner_email,
      -- mode() picks the spelling stored most often, the best guess at their
      -- real name when the roster has no entry for them.
      mode() WITHIN GROUP (ORDER BY p.owner_name) AS sdr_name,
      count(DISTINCT e.prospect_id) AS prospects,
      ${METRIC_COLUMNS}
    FROM prospect_analytics_events e
    JOIN prospects p ON p.id = e.prospect_id
    ${eventWhere(filters)}
    GROUP BY lower(p.owner_email)
    ${order}
  `);

  return rows.map((row) => ({
    ownerEmail: row.owner_email,
    sdrName: row.sdr_name,
    prospects: toNumber(row.prospects),
    ...toMetrics(row),
  }));
}
