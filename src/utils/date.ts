/**
 * Date formatting, in one place so the homepage list and (later) the tracking
 * and analytics pages can never disagree about how a date reads.
 *
 * The formatters are built once at module scope rather than per call —
 * `Intl.DateTimeFormat` construction is the expensive part.
 */

const LONG_DATE = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/** "March 19, 2026". */
export function formatLongDate(date: Date): string {
  return LONG_DATE.format(date);
}

/**
 * "today" / "yesterday" / "5 days ago", falling back to "Mar 19" past a month.
 *
 * `now` is injectable so this stays a pure function — otherwise it is untestable
 * and its output depends on when it happens to be called.
 */
export function relativeDate(date: Date, now: number = Date.now()): string {
  const days = Math.floor((now - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return SHORT_DATE.format(date);
}
