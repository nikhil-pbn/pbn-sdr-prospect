import "server-only";
import { prisma, Prisma } from "@/server/db";
import { ACTIVE_WINDOW_MS } from "@/utils/analytics-limits";
import { toNumber } from "./filters";

/**
 * Who has a prospect page open at this moment.
 *
 * Deliberately ignores the dashboard's date range. Every other number on the
 * page is scoped to the selected dates; this one is about right now, and
 * scoping it to "last month" could only ever return zero.
 *
 * "Open" and not "reading": a page sitting in a background tab counts, because
 * the tracker keeps sending presence pings while hidden. Two conditions:
 *
 *  - `closed_at IS NULL` — the visitor has not left. The pagehide beacon sets
 *    this the instant they close the tab or follow a link away.
 *  - `last_seen_at` inside the window — the fallback for departures no beacon
 *    can report: a crash, a dropped network, a killed process.
 *
 * One indexed lookup on `last_seen_at`, which is why this can be polled every
 * 15 seconds while the dashboard's aggregates cannot.
 */

export type OpenProspect = {
  id: string;
  slug: string;
  name: string;
  email: string;
  /** How many are on it right now — usually one, occasionally more. */
  readers: number;
  /** Seconds since the longest-running of those visits began. */
  openForSeconds: number;
};

export type ActiveNow = {
  /**
   * Pages open at this moment, counted as OPEN PROSPECTS rather than distinct
   * people: the dashboard asks how much of your work is being looked at, not
   * how many humans are in the building.
   */
  open: number;
  /** Which ones, busiest first — the contents of the popover. */
  prospects: OpenProspect[];
};

function windowStart(): Date {
  return new Date(Date.now() - ACTIVE_WINDOW_MS);
}

type Row = {
  id: string;
  slug: string;
  name: string;
  email: string;
  readers: bigint;
  open_for_seconds: number;
};

export async function activeNow(): Promise<ActiveNow> {
  const rows = await prisma.$queryRaw<Row[]>(Prisma.sql`
    SELECT
      p.id, p.slug, p.name, p.email,
      count(*) AS readers,
      -- Computed in Postgres, not the browser: a duration derived from Date.now()
      -- during render differs between the server pass and the client pass, which
      -- React reports as a hydration mismatch.
      max(EXTRACT(EPOCH FROM (now() - e.created_at)))::int AS open_for_seconds
    FROM prospect_analytics_events e
    -- An inner join is the filter here: events outlive a removed prospect.
    JOIN prospects p ON p.id = e.prospect_id
    WHERE e.closed_at IS NULL AND e.last_seen_at > ${windowStart()}
    GROUP BY p.id
    ORDER BY readers DESC, open_for_seconds ASC
  `);

  const prospects = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    email: row.email,
    readers: toNumber(row.readers),
    openForSeconds: row.open_for_seconds,
  }));

  return {
    // Summed over readers rather than rows, so one page open in two places
    // counts twice — the same thing the popover shows.
    open: prospects.reduce((total, entry) => total + entry.readers, 0),
    prospects,
  };
}

/**
 * The same question about one prospect. Separate from `activeNow` so the
 * single-prospect page stays a narrow indexed count.
 */
export async function activeOnProspect(prospectId: string): Promise<number> {
  const [row] = await prisma.$queryRaw<{ visitors: bigint }[]>(Prisma.sql`
    SELECT count(*) AS visitors
    FROM prospect_analytics_events e
    WHERE e.prospect_id = ${prospectId}::uuid
      AND e.closed_at IS NULL
      AND e.last_seen_at > ${windowStart()}
      AND EXISTS (SELECT 1 FROM prospects dp WHERE dp.id = e.prospect_id)
  `);
  return toNumber(row?.visitors ?? null);
}
