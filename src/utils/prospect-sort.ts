/**
 * Which columns the prospect listings sort by.
 *
 * Client-safe and separate from the server's ORDER BY map on purpose: the header
 * components need the keys to build links, the query needs them to build SQL,
 * and a frontend file must not reach into `@/server` to find out what a column
 * is called.
 *
 * The action columns — Links, Actions — are deliberately absent. They hold
 * buttons, not values, so there is nothing to put in order.
 */

import type { Sort, SortColumns } from "./table-sort";

/**
 * My prospects and All prospects share one query, so they share one set of
 * keys. A key one page does not show is still a key the other could show
 * tomorrow without touching the server.
 */
export const PROSPECT_SORT: SortColumns = {
  name: "text",
  email: "text",
  role: "text",
  owner: "text",
  lastViewed: "date",
  mode: "text",
  status: "text",
  hubspot: "text",
  tracking: "date",
  created: "date",
  updated: "date",
  published: "date",
};

/** Newest first: the reason to open either page is usually something recent. */
export const PROSPECT_SORT_DEFAULT: Sort = { key: "created", dir: "desc" };
