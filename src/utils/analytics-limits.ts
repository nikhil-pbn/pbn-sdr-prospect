/**
 * Numbers the tracker and the server must agree on.
 *
 * Neither side owns these. The browser paces its heartbeats by the interval and
 * the server caps each beat at a multiple of it, so if the two were typed
 * separately the cap could silently start trimming honest time. Shared module
 * rather than `server/`, because a client component importing from the server
 * tree crosses a boundary this project keeps deliberately clean.
 */

/**
 * How often the page reports active time. 20s sits inside the 15–30s band: often
 * enough that closing the tab loses at most a few seconds, rare enough that a
 * ten-minute read costs 30 requests rather than 600.
 */
export const HEARTBEAT_INTERVAL_MS = 20_000;

/**
 * The most active time ONE beat may claim. Twice the interval, so a beat delayed
 * by a busy main thread or a throttled background tab still counts in full,
 * while a client claiming minutes per beat is trimmed to what it could honestly
 * have measured.
 */
export const MAX_HEARTBEAT_MS = 2 * HEARTBEAT_INTERVAL_MS;

/**
 * The bound past which a duration is malformed rather than merely optimistic,
 * and the request is refused outright. Nothing over a day came from the tracker.
 */
export const ABSURD_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Upper bound for a heartbeat's stamp, which is epoch SECONDS.
 *
 * The stamp is the replay guard: a visit only accepts a beat whose stamp is
 * greater than the highest it has already applied. Seconds-since-epoch keeps
 * increasing across page reloads AND across tabs, where a per-page-load counter
 * restarts at 1 and would have every beat after a refresh rejected as a replay.
 *
 * Int32 max, matching the column. Good until 2038.
 */
export const MAX_SEQ = 2_147_483_647;

/** Matches the column width; a CTA label longer than this is not a label. */
export const MAX_ACTION_LENGTH = 120;

/**
 * How many clicks one session's row will accumulate before it stops growing.
 * Clicks share a single row per session, so without a ceiling a script clicking
 * in a loop grows one JSONB value without bound. The visit is still counted, it
 * just stops itemising.
 */
export const MAX_ACTIONS_PER_SESSION = 200;

/**
 * Ceiling on the active time one visit may accumulate. 24 hours — not a product
 * rule, it stops a client replaying beats with rising stamps from driving
 * `active_ms` toward the Int32 limit, where the addition itself would error.
 */
export const MAX_VISIT_ACTIVE_MS = 24 * 60 * 60 * 1000;

/**
 * How stale a visit's last sign of life may be and still count as "active now".
 *
 * Derived from the ping interval, never typed independently. Four intervals plus
 * a grace, because browsers throttle timers in hidden tabs to roughly once a
 * minute — a window tight enough to catch a close quickly would make those
 * readers flicker in and out. Catching a close quickly is `closedAt`'s job; this
 * is only the fallback for what a beacon cannot report: a crash, a dropped
 * network, a killed process.
 */
export const ACTIVE_WINDOW_MS = 4 * HEARTBEAT_INTERVAL_MS + 10_000;

/**
 * How often the dashboard asks who is active. Faster than any dashboard refresh:
 * the presence query is a single indexed count, where re-running five aggregates
 * this often would not be.
 */
export const ACTIVE_POLL_MS = 15_000;

/**
 * How often the dashboard re-renders its own numbers while the tab is visible.
 *
 * This re-runs the summary and the selected breakdown, which is heavier than
 * the presence count — but the dashboard is an internal page open to a handful
 * of admins, and a click that only shows up after F5 reads as a broken
 * dashboard. Matches the presence cadence so the two never visibly disagree.
 */
export const DASHBOARD_REFRESH_MS = 15_000;
