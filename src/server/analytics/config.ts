/**
 * Cookie names and lifetimes for anonymous visitor identity.
 *
 * Prefixed `pbn_prospects_` so they cannot collide with PbN Proposals' `pbn_vid`
 * and `pbn_sid` when both tools run on localhost, where cookies ignore the port.
 *
 * The timing bounds the tracker and the server share live in
 * `utils/analytics-limits` instead — a client component must not import from the
 * server tree.
 */

/** Anonymous browser identity. A year, so a returning prospect stays one person. */
export const VISITOR_COOKIE = "pbn_prospects_vid";
export const VISITOR_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

/**
 * One continuous visit. Sliding: every event pushes it out again, so reading for
 * an hour is one session, and coming back tomorrow is a second one.
 *
 * 30 minutes is the long-standing web-analytics convention. It matters here
 * because average time is measured PER SESSION, so this number is the divisor.
 */
export const VISIT_COOKIE = "pbn_prospects_sid";
export const VISIT_MAX_AGE_SECONDS = 30 * 60;
