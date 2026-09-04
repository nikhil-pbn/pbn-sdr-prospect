import "server-only";
import { prisma, Prisma } from "@/server/db";
import {
  DEFAULT_PER_PAGE,
  clampPage,
  skipFor,
  type Paged,
} from "@/utils/pagination";
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
 * Per-prospect rows for the By prospect table.
 *
 * An INNER JOIN, so only prospects with activity in the range appear — the
 * agreed rule, and the reason the table never fills up with zero rows for
 * prospects nobody has opened. Ordered by views because the question this table
 * answers is "what is getting read".
 *
 * The SDR is joined from `prospects`, never stored on the event: the name and
 * role are editable, so a copy taken at event time would freeze an old
 * spelling. Grouping is by `owner_email` (from the Google session, so it cannot
 * drift) while the display name comes from the roster — see the table.
 */

export type ProspectAnalyticsRow = Metrics & {
  id: string;
  slug: string;
  name: string;
  email: string;
  prospectRole: string | null;
  ownerEmail: string;
  /** The owner's session name; the fallback when the roster has no entry. */
  ownerName: string;
  lastViewedAt: Date | null;
};

type Row = MetricRow & {
  id: string;
  slug: string;
  name: string;
  email: string;
  prospect_role: string | null;
  owner_email: string;
  owner_name: string;
  last_viewed_at: Date | null;
};

/** The columns this table can be ordered by, on top of the five shared metrics. */
const COLUMNS: Record<string, Prisma.Sql> = {
  ...METRIC_ORDER,
  prospect: Prisma.sql`p.name`,
  role: Prisma.sql`p.prospect_role`,
  // The address, not the displayed name — the name is resolved from the roster
  // while rendering and has no column to sort on.
  sdr: Prisma.sql`lower(p.owner_email)`,
  lastViewed: Prisma.sql`p.last_viewed_at`,
};

/** Unique per output row, because the query groups by exactly this. */
const TIEBREAK = Prisma.sql`p.id`;

export async function prospectAnalytics(
  filters: AnalyticsFilters & { page?: number; perPage?: number; sort?: Sort },
): Promise<Paged<ProspectAnalyticsRow>> {
  const where = eventWhere(filters);
  const perPage = filters.perPage ?? DEFAULT_PER_PAGE;
  const order = analyticsOrderBy(
    filters.sort ?? ANALYTICS_SORT_DEFAULT.prospects,
    COLUMNS,
    TIEBREAK,
  );

  // Counted first so the page can be clamped before it is fetched — ?page=99
  // then shows the last page rather than an empty table.
  const [countRow] = await prisma.$queryRaw<{ total: bigint }[]>(Prisma.sql`
    SELECT count(DISTINCT e.prospect_id) AS total
    FROM prospect_analytics_events e
    ${where}
  `);
  const total = toNumber(countRow?.total ?? null);
  const page = clampPage(filters.page ?? 1, total, perPage);

  const rows = await prisma.$queryRaw<Row[]>(Prisma.sql`
    SELECT
      p.id, p.slug, p.name, p.email, p.prospect_role, p.owner_email, p.owner_name,
      p.last_viewed_at,
      ${METRIC_COLUMNS}
    FROM prospect_analytics_events e
    JOIN prospects p ON p.id = e.prospect_id
    ${where}
    GROUP BY p.id
    ${order}
    LIMIT ${perPage} OFFSET ${skipFor(page, perPage)}
  `);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      email: row.email,
      prospectRole: row.prospect_role,
      ownerEmail: row.owner_email,
      ownerName: row.owner_name,
      lastViewedAt: row.last_viewed_at,
      ...toMetrics(row),
    })),
    total,
    page,
    perPage,
  };
}
