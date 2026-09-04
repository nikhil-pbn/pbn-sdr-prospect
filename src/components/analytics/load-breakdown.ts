import "server-only";
import {
  dateAnalytics,
  prospectAnalytics,
  sdrAnalytics,
  type DateAnalyticsRow,
  type ProspectAnalyticsRow,
  type SdrAnalyticsRow,
} from "@/server/analytics/queries";
import { bucketFor, type Bucket } from "@/utils/date-bucket";
import type { AnalyticsView } from "@/utils/analytics-view";
import type { DateRange } from "@/utils/date-range";
import type { Paged } from "@/utils/pagination";
import type { Sort } from "@/utils/table-sort";

/**
 * Fetches the one breakdown the selected view needs, and nothing else.
 *
 * Separated from the component so the report can await it inside a `try` and
 * render the result outside one — React runs a returned element after the
 * function has finished, so JSX inside a `try` catches nothing its children
 * throw while looking like it does.
 *
 * A discriminated union rather than three nullable fields: the renderer then
 * cannot read the date rows while the SDR view is selected.
 */

export type Breakdown =
  | { view: "sdr"; rows: SdrAnalyticsRow[] }
  | { view: "date"; bucket: Bucket; rows: DateAnalyticsRow[] }
  | { view: "prospects"; result: Paged<ProspectAnalyticsRow> };

export async function loadBreakdown({
  range,
  view,
  page,
  sort,
}: {
  range: DateRange;
  view: AnalyticsView;
  /** Only the prospect table uses this; SDR and date rows are bounded anyway. */
  page: number;
  /** Already checked against THIS view's columns by the page. */
  sort: Sort;
}): Promise<Breakdown> {
  if (view === "sdr") {
    return { view, rows: await sdrAnalytics({ range, sort }) };
  }

  if (view === "date") {
    const bucket = bucketFor(range);
    return { view, bucket, rows: await dateAnalytics({ range, bucket, sort }) };
  }

  return {
    view: "prospects",
    result: await prospectAnalytics({ range, page, sort }),
  };
}
