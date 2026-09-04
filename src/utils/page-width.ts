/**
 * The container widths the internal pages use, named once.
 *
 * The header and the page body have to agree on a width, and two hardcoded
 * strings in two files is what lets them drift. Both read the value from here: a
 * page picks a name, nothing picks a measurement.
 *
 * The literals stay literal on purpose — Tailwind discovers classes by scanning
 * source text, so a composed or computed class name would never be generated.
 */

export const PAGE_WIDTHS = {
  /** The builder: a form is unreadable at full width. */
  narrow: "max-w-7xl",
  /** Listings and dashboards (Steps 4–5), where wide tables need the room. */
  wide: "max-w-9/10",
} as const;

export type PageWidth = keyof typeof PAGE_WIDTHS;
