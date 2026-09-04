/**
 * Page maths for the listing tables.
 *
 * Pagination is a URL, not component state: `?page=3` survives a reload, can be
 * sent to someone, and — because the page is a Server Component — means the
 * database only ever returns one screenful. A client-side pager would still
 * fetch every row and hide most of them, which is the opposite of the point.
 *
 * Client-safe: no imports, so a `"use client"` component can share the same
 * maths rather than re-deriving it and disagreeing by one.
 */

/** One constant for every table, so the tables stay visually consistent. */
export const DEFAULT_PER_PAGE = 25;

/** What a paginated query returns. */
export type Paged<T> = {
  rows: T[];
  /** Total matching rows, not the length of `rows`. */
  total: number;
  /** The page actually served — already clamped, so it may differ from the URL. */
  page: number;
  perPage: number;
};

/**
 * A page number from a query string.
 *
 * Everything unusable becomes 1: absent, empty, "abc", "-4", "1e3", or an array
 * (which is what Next gives you for `?page=1&page=2`). A listing page must never
 * 500 over a hand-edited URL.
 */
export function parsePage(raw?: string | string[]): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  // Bounded so `?page=1e30` can't turn into an absurd OFFSET.
  return Math.min(parsed, 1_000_000);
}

export function pageCount(total: number, perPage = DEFAULT_PER_PAGE): number {
  return Math.max(1, Math.ceil(total / perPage));
}

/**
 * The page that can actually be served.
 *
 * Asking for page 9 of 3 shows the last page rather than an empty table: an
 * empty table reads as "there is nothing here", which is a different and wrong
 * answer.
 */
export function clampPage(
  page: number,
  total: number,
  perPage = DEFAULT_PER_PAGE,
): number {
  return Math.min(Math.max(1, page), pageCount(total, perPage));
}

export function skipFor(page: number, perPage = DEFAULT_PER_PAGE): number {
  return (page - 1) * perPage;
}

/** 1-based inclusive range on the current page, for "Showing 26–50 of 163". */
export function pageWindow(
  page: number,
  total: number,
  perPage = DEFAULT_PER_PAGE,
): { from: number; to: number } {
  if (total === 0) return { from: 0, to: 0 };
  const from = skipFor(page, perPage) + 1;
  return { from, to: Math.min(from + perPage - 1, total) };
}
