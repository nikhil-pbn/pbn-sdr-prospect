/**
 * Which columns each analytics breakdown sorts by.
 *
 * Keyed by view, because the three breakdowns are three different tables that
 * happen to share five columns. That shape does real work: switching from By
 * prospect to By SDR drops `?sort=lastViewed`, which the SDR table has no column
 * for, and `parseSort` falls back rather than erroring on it.
 */

import type { AnalyticsView } from "./analytics-view";
import type { Sort, SortColumns } from "./table-sort";

/**
 * The five measurement columns every breakdown shares — the sort-side twin of
 * `METRIC_HEAD`/`MetricCells`, and shared for the same reason: three tables
 * writing their own is how they drift into disagreeing.
 */
export const METRIC_SORT: SortColumns = {
  views: "number",
  unique: "number",
  time: "number",
  avg: "number",
  clicks: "number",
};

export const ANALYTICS_SORT: Record<AnalyticsView, SortColumns> = {
  prospects: {
    prospect: "text",
    role: "text",
    sdr: "text",
    ...METRIC_SORT,
    lastViewed: "date",
  },
  sdr: { sdr: "text", prospects: "number", ...METRIC_SORT },
  date: { bucket: "date", prospects: "number", ...METRIC_SORT },
};

/**
 * Busiest first everywhere except the date breakdown, which reads newest first.
 */
export const ANALYTICS_SORT_DEFAULT: Record<AnalyticsView, Sort> = {
  prospects: { key: "views", dir: "desc" },
  sdr: { key: "views", dir: "desc" },
  date: { key: "bucket", dir: "desc" },
};
