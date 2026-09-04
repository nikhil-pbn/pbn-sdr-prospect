/**
 * IST calendar arithmetic, for analytics buckets and date presets.
 *
 * Timestamps are stored as `timestamptz`, so the instant is never ambiguous.
 * What needs a timezone is the question "which day was that?" — and the answer
 * has to be the team's day, not the server's. A UTC-based "Today" would begin at
 * 05:30 IST and split every working morning across two buckets.
 *
 * IST is a fixed +05:30 with no daylight saving, ever, which is what lets this
 * be plain arithmetic instead of a timezone library: shift an instant by the
 * offset and its UTC calendar fields ARE its IST calendar fields. The day a
 * second timezone is needed, this file has to move to `Intl` parts or a real
 * library — the trick does not generalise.
 */

/** +05:30. Fixed by law since 1945; India has no DST. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** For Postgres `AT TIME ZONE`, so SQL buckets and JS presets agree. */
export const ANALYTICS_TIMEZONE = "Asia/Kolkata";

/** The IST calendar fields of an instant. */
export function istFields(at: number) {
  const shifted = new Date(at + IST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    /** 0 = Sunday, matching Date. */
    weekday: shifted.getUTCDay(),
  };
}

/**
 * The instant at which the given IST civil date begins.
 *
 * Out-of-range parts are fine and relied on: `day - 29` and `month - 1`
 * normalise across month and year boundaries, so no preset needs its own edge
 * case.
 */
export function istDayStart(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day) - IST_OFFSET_MS);
}

/**
 * Days since Monday. Weeks start Monday here. `getUTCDay()` calls Sunday 0,
 * which would make "This week" reset mid-weekend.
 */
export function mondayOffset(weekday: number): number {
  return weekday === 0 ? 6 : weekday - 1;
}
