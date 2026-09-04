/**
 * Prospects are served from the root: https://host/prospect-priya-patel-k7m2xq
 *
 * No `/lp/` segment, deliberately — the brief rules it out, and PbN Proposals
 * removed the same thing after living with two URL shapes.
 */

/**
 * The marker that says a root-level path is a prospect. Defined here rather than
 * in `server/prospect/slug`, which imports `node:crypto` and so cannot be pulled
 * into a client component.
 */
export const PROSPECT_SLUG_PREFIX = "prospect";

/** Trailing slashes off the configured base, so joins never double up. */
function appBase(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
}

/** The path that serves this prospect. */
export function prospectPathFor(slug: string): string {
  return `/${slug}`;
}

/** The shareable URL for a slug. Absolute when a base is configured, else a path. */
export function prospectUrlFor(slug: string): string {
  return `${appBase()}${prospectPathFor(slug)}`;
}

/**
 * The identifying part of a slug, for INTERNAL lists only — never for a link.
 * Every prospect starts with the same prefix, so a truncated slug in a narrow
 * column would spend the whole column on it.
 */
export function shortSlug(slug: string): string {
  const marker = `${PROSPECT_SLUG_PREFIX}-`;
  return slug.startsWith(marker) ? slug.slice(marker.length) : slug;
}

/** The editor for a prospect. One place, so a route move is one edit. */
export function editorPathFor(id: string): string {
  return `/editor/${id}`;
}
