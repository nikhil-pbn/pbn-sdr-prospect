/**
 * How wide a bucket the date breakdown should use.
 *
 * A daily row per day is the most useful shape until the range gets long, at
 * which point it stops being readable: a year of daily rows is 365 of them, and
 * nobody reads that to find a trend. So the grain widens with the range. Chosen
 * from the range length rather than offered as a control, because the right
 * answer is nearly always implied by the dates.
 */

import type { DateRange } from "./date-range";

export type Bucket = "day" | "week" | "month";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Above this many days, daily rows stop being readable. */
const DAILY_LIMIT_DAYS = 31;
/** Above this, even weekly rows run long — a year is 52 of them. */
const WEEKLY_LIMIT_DAYS = 180;

export function bucketFor(range: DateRange): Bucket {
  // All Time is unbounded and usually spans months, so it starts at the coarsest
  // grain rather than trying to guess.
  if (!range.from || !range.to) return "month";

  const days = Math.ceil((range.to.getTime() - range.from.getTime()) / DAY_MS);
  if (days <= DAILY_LIMIT_DAYS) return "day";
  if (days <= WEEKLY_LIMIT_DAYS) return "week";
  return "month";
}

const DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "Asia/Kolkata",
});

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/**
 * How one bucket reads in the table. Formatted in IST explicitly, because the
 * bucket boundaries were computed in IST — a formatter running in the server's
 * timezone would label the row with a different day than the one it aggregates.
 */
export function bucketLabel(start: Date, bucket: Bucket): string {
  if (bucket === "month") return MONTH_FORMAT.format(start);
  if (bucket === "day") return DAY_FORMAT.format(start);
  // A week is named by the Monday it starts on, matching how the presets treat weeks.
  return `Week of ${DAY_FORMAT.format(start)}`;
}
