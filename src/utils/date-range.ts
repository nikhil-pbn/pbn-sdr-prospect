/**
 * The dashboard's one date filter, resolved to real instants.
 *
 * Every preset is a HALF-OPEN interval [from, to): the end is the first moment
 * NOT included. An inclusive end at 23:59:59.999 silently drops events in the
 * last millisecond of a day and needs a different comparison per query.
 * Half-open makes `createdAt >= from AND createdAt < to` correct everywhere,
 * with no edge case at midnight.
 *
 * Boundaries are IST civil days — see `utils/ist` for why and how.
 */

import { istDayStart, istFields, mondayOffset } from "./ist";

export type RangeKey =
  | "all"
  | "today"
  | "yesterday"
  | "last7"
  | "last14"
  | "last30"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export type DateRange = {
  key: RangeKey;
  label: string;
  /** Inclusive start, or null for All Time. */
  from: Date | null;
  /** EXCLUSIVE end, or null for All Time. */
  to: Date | null;
};

export const RANGE_LABELS: Record<RangeKey, string> = {
  all: "All time",
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 days",
  last14: "Last 14 days",
  last30: "Last 30 days",
  thisWeek: "This week",
  lastWeek: "Last week",
  thisMonth: "This month",
  lastMonth: "Last month",
  thisYear: "This year",
  custom: "Custom range",
};

/** The order they appear in the picker: narrowest first, then the wider windows. */
export const RANGE_KEYS = Object.keys(RANGE_LABELS) as RangeKey[];

export const DEFAULT_RANGE_KEY: RangeKey = "all";

/**
 * Resolve a preset against a clock.
 *
 * `now` is injectable so this is a pure function — a range builder that reads
 * the clock internally cannot be tested, and "Today" is exactly the thing you
 * want a test for.
 */
export function resolveRange(
  key: RangeKey,
  now: number = Date.now(),
): DateRange {
  const { year, month, day, weekday } = istFields(now);
  const startOfToday = istDayStart(year, month, day);
  const startOfTomorrow = istDayStart(year, month, day + 1);
  const label = RANGE_LABELS[key];

  switch (key) {
    case "today":
      return { key, label, from: startOfToday, to: startOfTomorrow };
    case "yesterday":
      return {
        key,
        label,
        from: istDayStart(year, month, day - 1),
        to: startOfToday,
      };
    // "Last N days" INCLUDES today, so last7 is today plus the six before it.
    // The alternative reading makes the number stop moving until tomorrow.
    case "last7":
      return {
        key,
        label,
        from: istDayStart(year, month, day - 6),
        to: startOfTomorrow,
      };
    case "last14":
      return {
        key,
        label,
        from: istDayStart(year, month, day - 13),
        to: startOfTomorrow,
      };
    case "last30":
      return {
        key,
        label,
        from: istDayStart(year, month, day - 29),
        to: startOfTomorrow,
      };
    case "thisWeek":
      return {
        key,
        label,
        from: istDayStart(year, month, day - mondayOffset(weekday)),
        to: startOfTomorrow,
      };
    case "lastWeek": {
      const thisMonday = day - mondayOffset(weekday);
      return {
        key,
        label,
        from: istDayStart(year, month, thisMonday - 7),
        to: istDayStart(year, month, thisMonday),
      };
    }
    case "thisMonth":
      return {
        key,
        label,
        from: istDayStart(year, month, 1),
        to: startOfTomorrow,
      };
    case "lastMonth":
      // Month -1 with day 1 is safe: Date.UTC normalises January back to December.
      return {
        key,
        label,
        from: istDayStart(year, month - 1, 1),
        to: istDayStart(year, month, 1),
      };
    case "thisYear":
      return { key, label, from: istDayStart(year, 0, 1), to: startOfTomorrow };
    case "all":
    case "custom":
      // Custom needs its own dates; a bare "custom" with none is All Time.
      return { key, label, from: null, to: null };
  }
}
