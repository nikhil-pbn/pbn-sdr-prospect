/**
 * Reads the date filter out of the URL, and writes it back into links.
 *
 * The range lives in `searchParams`, not React state, for the same reason the
 * tables paginate that way: the page stays a Server Component, the aggregation
 * runs in Postgres, and a filtered dashboard is a URL somebody can bookmark or
 * paste into Slack. It also means every table on the page reads its range from
 * ONE place, which is what stops two sections silently disagreeing.
 */

import {
  DEFAULT_RANGE_KEY,
  RANGE_LABELS,
  resolveRange,
  type DateRange,
  type RangeKey,
} from "./date-range";
import { istDayStart, istFields } from "./ist";

/** `?range=` values that aren't ours fall back rather than erroring. */
export function parseRangeKey(value: unknown): RangeKey {
  return typeof value === "string" && value in RANGE_LABELS
    ? (value as RangeKey)
    : DEFAULT_RANGE_KEY;
}

/** A `YYYY-MM-DD` from `<input type="date">`, read as an IST civil date. */
function parseCivilDate(value: unknown): [number, number, number] | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [year, month, day] = [+match[1], +match[2] - 1, +match[3]];
  // Round-trip check: "2026-02-31" parses arithmetically but is not a real
  // date, and Date.UTC would quietly slide it to March.
  const probe = new Date(Date.UTC(year, month, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return [year, month, day];
}

export type RangeParams = {
  range?: string | string[];
  from?: string | string[];
  to?: string | string[];
};

/** Arrays happen when a param is repeated in the query string; take the first. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * The selected range, ready for a query.
 *
 * A custom range whose dates are missing or unparseable degrades to the default
 * preset rather than showing an empty dashboard — a half-typed date in the URL
 * is a normal state while somebody is picking, not an error worth a screen.
 */
export function parseDateRange(
  params: RangeParams,
  now: number = Date.now(),
): DateRange {
  const key = parseRangeKey(first(params.range));
  if (key !== "custom") return resolveRange(key, now);

  const start = parseCivilDate(first(params.from));
  const end = parseCivilDate(first(params.to));
  if (!start || !end) return resolveRange(DEFAULT_RANGE_KEY, now);

  // Order the two civil dates BEFORE turning the end into an exclusive bound.
  // Reversed dates are a slip, not a request for nothing.
  const [early, late] =
    Date.UTC(...start) <= Date.UTC(...end) ? [start, end] : [end, start];

  return {
    key: "custom",
    label: RANGE_LABELS.custom,
    from: istDayStart(...early),
    // The `to` date is INCLUSIVE to whoever picked it, so the exclusive bound is
    // the start of the following day.
    to: istDayStart(late[0], late[1], late[2] + 1),
  };
}

/** `YYYY-MM-DD` in IST, for pre-filling the two date inputs. */
export function toCivilDateInput(at: Date): string {
  const { year, month, day } = istFields(at.getTime());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/**
 * The range as query params, so pagination and sort links keep the filter.
 * Without this, paging to page 2 would silently reset the dashboard's dates.
 */
export function rangeQuery(range: DateRange): Record<string, string> {
  if (range.key !== "custom" || !range.from || !range.to) {
    return { range: range.key };
  }
  // The stored `to` is exclusive; show the inclusive date the user picked.
  const inclusiveEnd = new Date(range.to.getTime() - 1);
  return {
    range: "custom",
    from: toCivilDateInput(range.from),
    to: toCivilDateInput(inclusiveEnd),
  };
}
