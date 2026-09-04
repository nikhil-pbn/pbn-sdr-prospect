import { unstable_rethrow } from "next/navigation";
import { DbUnreachableNotice } from "@/components/notices/db-unreachable-notice";
import { AnalyticsSummaryCards, SummaryCardsSkeleton } from "./summary-cards";
import { BreakdownSection } from "./breakdown-section";
import { SectionHeading } from "./section-heading";
import { PROSPECT_ANALYTICS_COLUMNS } from "./prospect-analytics-table";
import { SDR_ANALYTICS_COLUMNS } from "./sdr-table";
import { dateColumns } from "./date-table";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/table-skeleton";
import type { HeadColumn } from "@/components/table-head-row";
import { bucketFor } from "@/utils/date-bucket";
import { analyticsSummary } from "@/server/analytics/queries";
import { loadBreakdown, type Breakdown } from "./load-breakdown";
import {
  analyticsQuery,
  VIEW_LABELS,
  type AnalyticsView,
} from "@/utils/analytics-view";
import { ANALYTICS_SORT, ANALYTICS_SORT_DEFAULT } from "@/utils/analytics-sort";
import { sortQuery, type Sort } from "@/utils/table-sort";
import type { DateRange } from "@/utils/date-range";

/**
 * Loads and renders the dashboard: the headline numbers, then ONE breakdown.
 *
 * Only the selected view's query runs. The summary cards stay whatever the
 * view: they are the same six numbers however the rows beneath them are
 * grouped.
 *
 * Both loads take the SAME range object, resolved once by the page. That is
 * the whole mechanism behind "every section respects the filter": nothing here
 * reads the URL for itself, so no two parts can describe a different window.
 *
 * Only the `await` sits inside `try`, never the JSX. React renders a returned
 * element after this function has finished, so a `try` wrapped around the
 * return would not catch anything the children throw.
 */
export async function AnalyticsReport({
  range,
  view,
  page,
  sort,
}: {
  range: DateRange;
  view: AnalyticsView;
  page: number;
  sort: Sort;
}) {
  let summary: Awaited<ReturnType<typeof analyticsSummary>>;
  let breakdown: Breakdown;

  try {
    summary = await analyticsSummary({ range });
    breakdown = await loadBreakdown({ range, view, page, sort });
  } catch (caught) {
    unstable_rethrow(caught);
    return (
      <DbUnreachableNotice
        className="rounded-lg border bg-muted/40 p-5"
        detail={caught instanceof Error ? caught.message : undefined}
      />
    );
  }

  // Sort links carry the range and the view — but never the sort itself, which
  // each header sets, nor the page, since re-sorting has to start at page 1.
  const query = analyticsQuery(range, view);
  // Page links carry all three.
  const pageQuery = {
    ...query,
    ...sortQuery(sort, ANALYTICS_SORT_DEFAULT[view]),
  };

  return (
    <>
      <AnalyticsSummaryCards
        metrics={summary}
        lead={{
          value: summary.prospectsWithActivity,
          label: "Prospects viewed",
          // Spelled out because "Prospects: 12" invites the reading "we have 12".
          hint: `of ${summary.publishedProspects} published`,
        }}
      />

      <div className="mt-10">
        <BreakdownSection
          breakdown={breakdown}
          sort={sort}
          query={query}
          pageQuery={pageQuery}
        />
      </div>
    </>
  );
}

/** The header each breakdown's skeleton draws — the loaded table's own spec. */
function breakdownColumns(view: AnalyticsView, range: DateRange): HeadColumn[] {
  if (view === "sdr") return SDR_ANALYTICS_COLUMNS;
  if (view === "date") return dateColumns(bucketFor(range));
  return PROSPECT_ANALYTICS_COLUMNS;
}

/**
 * Roughly how many rows each breakdown tends to have — a handful of SDRs, a
 * week of days, a page of prospects — so the table does not shrink to a third
 * of its loading height when the real rows arrive.
 */
const SKELETON_ROWS_FOR: Record<AnalyticsView, number> = {
  prospects: 8,
  sdr: 3,
  date: 7,
};

/**
 * The dashboard's shape while its queries run: the six cards, then the selected
 * breakdown's heading and its real header over grey rows.
 *
 * Takes the same range, view and sort the report will, so the header it draws
 * IS the header the rows arrive under — same columns, same arrows — and the
 * date breakdown's first column is already named for the right grain. The
 * count in the heading is the one thing not known yet, so it is a small grey
 * mark rather than a wrong number.
 */
export function AnalyticsReportSkeleton({
  range,
  view,
  sort,
}: {
  range: DateRange;
  view: AnalyticsView;
  sort: Sort;
}) {
  return (
    <>
      <SummaryCardsSkeleton />

      <div className="mt-10">
        <SectionHeading>
          {VIEW_LABELS[view]}{" "}
          <Skeleton className="inline-block h-3 w-8 align-middle" />
        </SectionHeading>
        <TableSkeleton
          columns={breakdownColumns(view, range)}
          rows={SKELETON_ROWS_FOR[view]}
          sort={{
            sortable: ANALYTICS_SORT[view],
            sort,
            basePath: "/analytics",
            query: analyticsQuery(range, view),
          }}
          label="analytics"
        />
      </div>
    </>
  );
}
