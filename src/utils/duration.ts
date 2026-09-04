/**
 * Human-readable durations for the analytics dashboard.
 *
 * Two units, never three: "1h 12m" reads at a glance where "1h 12m 8s" has to
 * be parsed. Seconds only matter when they are all there is, and they are
 * dropped from an exact minute so "4m" does not render as "4m 0s".
 *
 * Milliseconds in, because that is what the heartbeats store.
 */

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "0s" for nothing at all — callers that want an em dash decide that themselves. */
export function formatDuration(ms: number): string {
  // Defensive rather than decorative: a SUM over an empty group comes back null
  // from Postgres, and NaN formatted naively is what puts "NaNm" on a dashboard.
  if (!Number.isFinite(ms) || ms <= 0) return "0s";

  if (ms < MINUTE) return `${Math.floor(ms / SECOND)}s`;

  if (ms < HOUR) {
    const minutes = Math.floor(ms / MINUTE);
    const seconds = Math.floor((ms % MINUTE) / SECOND);
    return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  if (ms < DAY) {
    const hours = Math.floor(ms / HOUR);
    const minutes = Math.floor((ms % HOUR) / MINUTE);
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  return hours ? `${days}d ${hours}h` : `${days}d`;
}
