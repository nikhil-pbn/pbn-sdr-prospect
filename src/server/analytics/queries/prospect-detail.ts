import "server-only";
import { prisma, Prisma, type ProspectStatus } from "@/server/db";
import { eventWhere, toNumber, type AnalyticsFilters } from "./filters";
import {
  METRIC_COLUMNS,
  toMetrics,
  type MetricRow,
  type Metrics,
} from "./metrics";

/**
 * Everything about one prospect's engagement, plus which CTAs were actually
 * pressed.
 *
 * `topActions` unnests the per-visit `actions` arrays. That is the payoff from
 * accumulating clicks on the visit row rather than in their own table: the
 * labels are still individually addressable, so counting them per CTA is one
 * `jsonb_array_elements` away.
 */

export type TopAction = { action: string; clicks: number };

export type ProspectDetail = Metrics & {
  /** Distinct visitors who came back for a second visit. */
  returningVisitors: number;
  lastViewedAt: Date | null;
  topActions: TopAction[];
};

export async function prospectDetailAnalytics(
  filters: AnalyticsFilters & { prospectId: string },
): Promise<ProspectDetail> {
  const where = eventWhere(filters);

  const [row] = await prisma.$queryRaw<
    (MetricRow & { last_seen: Date | null; returning: bigint })[]
  >(Prisma.sql`
    SELECT
      max(e.last_seen_at) AS last_seen,
      -- Visitors with more than one visit. A prospect who comes back is the
      -- strongest signal this table can offer.
      count(*) FILTER (WHERE e.visits > 1) AS returning,
      ${METRIC_COLUMNS}
    FROM (
      SELECT e.*, count(*) OVER (PARTITION BY e.visitor_id) AS visits
      FROM prospect_analytics_events e
      ${where}
    ) e
  `);

  const topActions = await prisma.$queryRaw<
    { action: string; clicks: bigint }[]
  >(Prisma.sql`
    SELECT elem->>'a' AS action, count(*) AS clicks
    FROM prospect_analytics_events e,
         jsonb_array_elements(coalesce(e.actions, '[]'::jsonb)) elem
    ${where}
    GROUP BY elem->>'a'
    ORDER BY clicks DESC, action ASC
    LIMIT 20
  `);

  return {
    lastViewedAt: row?.last_seen ?? null,
    returningVisitors: toNumber(row?.returning ?? null),
    topActions: topActions.map((a) => ({
      action: a.action,
      clicks: toNumber(a.clicks),
    })),
    ...toMetrics(row),
  };
}

export type ProspectIdentity = {
  id: string;
  slug: string;
  name: string;
  email: string;
  prospectRole: string | null;
  ownerEmail: string;
  ownerName: string;
  status: ProspectStatus;
  publishedAt: Date | null;
};

/**
 * Who the prospect is, for the detail page's heading. A narrow select rather
 * than reusing the editor's loader, which joins every section's content.
 * Returns null so the page can 404 rather than render a heading for something
 * that does not exist.
 */
export async function prospectIdentity(
  id: string,
): Promise<ProspectIdentity | null> {
  return prisma.prospect.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      email: true,
      prospectRole: true,
      ownerEmail: true,
      ownerName: true,
      status: true,
      publishedAt: true,
    },
  });
}
