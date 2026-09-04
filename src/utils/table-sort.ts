/**
 * Column sorting for every table in the app.
 *
 * In the URL, like pagination, and for the same reasons: the pages stay Server
 * Components, the ordering runs in Postgres, and a sorted table is a link
 * somebody can send. Client-side sorting was never an option — the tables
 * paginate, so sorting the rows React holds would reorder one page of 25 and
 * present it as the ordering of all 300.
 *
 * Client-safe: no imports, so a `"use client"` component can share the same
 * rules rather than re-deriving them and disagreeing.
 */

export type SortDir = "asc" | "desc";

/** What a column holds — which is what decides which way one click sorts it. */
export type ColumnKind = "text" | "number" | "date";

/** A table's sortable columns: the key that appears in the URL, and its kind. */
export type SortColumns = Record<string, ColumnKind>;

export type Sort = { key: string; dir: SortDir };

/**
 * Names read A→Z; numbers and dates read biggest-first.
 *
 * Clicking a date column and landing on the oldest row first is the opposite
 * of the question anybody clicks that column to ask.
 */
const FIRST_CLICK: Record<ColumnKind, SortDir> = {
  text: "asc",
  number: "desc",
  date: "desc",
};

/** Arrays happen when a param is repeated in the query string; take the first. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export type SortParams = {
  sort?: string | string[];
  dir?: string | string[];
};

/**
 * The sort a request is asking for.
 *
 * Anything unrecognised falls back to the table's default rather than erroring,
 * which matters more than it looks: `columns` is the whitelist that every
 * ORDER BY is built from, so a key that survives this function is a key the
 * server has an expression for. Nothing from the query string is ever
 * interpolated into SQL.
 */
export function parseSort(
  params: SortParams,
  columns: SortColumns,
  fallback: Sort,
): Sort {
  const key = first(params.sort);
  if (!key || !(key in columns)) return fallback;

  const dir = first(params.dir);
  return {
    key,
    // A known column with a missing or mangled direction still sorts, the way
    // that column would on a first click.
    dir: dir === "asc" || dir === "desc" ? dir : FIRST_CLICK[columns[key]],
  };
}

/** Where a click on `key` leads: flip if it is already sorted, else its natural way. */
export function nextSort(
  key: string,
  columns: SortColumns,
  current: Sort,
): Sort {
  if (current.key === key) {
    return { key, dir: current.dir === "asc" ? "desc" : "asc" };
  }
  return { key, dir: FIRST_CLICK[columns[key]] };
}

/**
 * The sort as query params, for the links that have to carry it — pagination
 * above all. Without it, paging to page 2 of a table sorted by name would
 * quietly hand back page 2 of the default ordering.
 *
 * Empty at the default, so the canonical URL has no redundant `?sort=…&dir=…`.
 */
export function sortQuery(sort: Sort, fallback: Sort): Record<string, string> {
  if (isDefaultSort(sort, fallback)) return {};
  return { sort: sort.key, dir: sort.dir };
}

/**
 * Whether the table is in the order it opens in. Read by the blurb above the
 * listings, which claims the rows are "newest first" — true until somebody
 * sorts by name.
 */
export function isDefaultSort(sort: Sort, fallback: Sort): boolean {
  return sort.key === fallback.key && sort.dir === fallback.dir;
}
