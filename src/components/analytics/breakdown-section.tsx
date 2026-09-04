import { TablePagination } from "@/components/table-pagination";
import { ProspectAnalyticsTable } from "./prospect-analytics-table";
import { SdrAnalyticsTable } from "./sdr-table";
import { DateAnalyticsTable } from "./date-table";
import { SectionHeading } from "./section-heading";
import type { Breakdown } from "./load-breakdown";
import { VIEW_LABELS } from "@/utils/analytics-view";
import type { Sort } from "@/utils/table-sort";

/**
 * Renders whichever breakdown was loaded: its heading, its table, and a pager
 * if that table has one.
 *
 * Two query bags, and the difference matters. `query` goes on the sort links
 * and holds the range and the view but never the sort or the page: a header
 * sets the sort itself, and re-sorting has to start again at page 1.
 * `pageQuery` adds the sort, because a page link that drops it hands back page
 * 2 of the default ordering instead.
 */
export function BreakdownSection({
  breakdown,
  sort,
  query,
  pageQuery,
}: {
  breakdown: Breakdown;
  sort: Sort;
  query: Record<string, string>;
  pageQuery: Record<string, string>;
}) {
  if (breakdown.view === "sdr") {
    return (
      <>
        <SectionHeading>
          {VIEW_LABELS.sdr} ({breakdown.rows.length})
        </SectionHeading>
        <SdrAnalyticsTable rows={breakdown.rows} sort={sort} query={query} />
      </>
    );
  }

  if (breakdown.view === "date") {
    return (
      <>
        <SectionHeading>
          {VIEW_LABELS.date} (by {breakdown.bucket})
        </SectionHeading>
        <DateAnalyticsTable
          rows={breakdown.rows}
          bucket={breakdown.bucket}
          sort={sort}
          query={query}
        />
      </>
    );
  }

  return (
    <>
      <SectionHeading>
        {VIEW_LABELS.prospects} ({breakdown.result.total})
      </SectionHeading>
      <ProspectAnalyticsTable
        rows={breakdown.result.rows}
        sort={sort}
        query={query}
      />
      <TablePagination
        page={breakdown.result.page}
        total={breakdown.result.total}
        perPage={breakdown.result.perPage}
        basePath="/analytics"
        label="prospects"
        query={pageQuery}
      />
    </>
  );
}
