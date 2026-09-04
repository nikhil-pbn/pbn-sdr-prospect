/**
 * Which single breakdown the dashboard is showing.
 *
 * Three tables stacked on one page meant scrolling past two to reach the one
 * you wanted, and it made the page run every aggregate to render things nobody
 * was reading at the same time. One at a time is both easier to read and
 * cheaper: the report only runs the query behind the selected view.
 *
 * In the URL like the date range, for the same reasons — the page stays a
 * Server Component, and a particular view of a particular range is a link
 * somebody can send.
 */

import type { DateRange } from "./date-range";
import { rangeQuery } from "./date-range-params";

export type AnalyticsView = "prospects" | "sdr" | "date";

export const VIEW_LABELS: Record<AnalyticsView, string> = {
  prospects: "By prospect",
  sdr: "By SDR",
  date: "Engagement over time",
};

export const VIEW_KEYS = Object.keys(VIEW_LABELS) as AnalyticsView[];

/**
 * Prospects first, because it is the most specific: every other view is a way of
 * grouping these same rows, and it is the one that leads somewhere — each row
 * opens that prospect's own page.
 */
export const DEFAULT_VIEW: AnalyticsView = "prospects";

/** Anything unrecognised falls back rather than erroring. */
export function parseView(value: unknown): AnalyticsView {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && first in VIEW_LABELS
    ? (first as AnalyticsView)
    : DEFAULT_VIEW;
}

/**
 * Every link on the dashboard carries BOTH the range and the view.
 *
 * One helper rather than each link assembling its own params, because the
 * failure is silent: a pagination link that forgets `view` sends you to page 2
 * of a different table, and a view tab that forgets `range` quietly resets the
 * dates the numbers describe.
 */
export function analyticsQuery(
  range: DateRange,
  view: AnalyticsView,
): Record<string, string> {
  const query = rangeQuery(range);
  // The default is the bare URL, so the canonical link has no redundant ?view=.
  if (view !== DEFAULT_VIEW) query.view = view;
  return query;
}
