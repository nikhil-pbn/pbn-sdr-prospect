import "server-only";
import { randomBytes } from "node:crypto";
import { PROSPECT_SLUG_PREFIX } from "@/utils/prospect-url";

/**
 * Public slug for a prospect, e.g. "prospect-priya-patel-k7m2xq".
 *
 * Shape: the prefix, kebab(prospect name), and 6 random chars. The random
 * suffix is what makes the URL unguessable — the page has no auth, so the name
 * alone would let anyone walk the namespace.
 *
 * The PREFIX earns its length: prospects are served from the root of the domain,
 * so it is the one thing that tells `/[slug]` a path is meant for it, without a
 * database lookup on every stray request the domain receives.
 */
const PREFIX = PROSPECT_SLUG_PREFIX;

/** Whether a path segment is one of ours. Runs on every unmatched request. */
export function isProspectSlug(slug: string): boolean {
  return slug.startsWith(`${PREFIX}-`);
}

function kebab(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** 6 chars from an alphabet with no 0/o/1/l/i, so a slug read aloud is unambiguous. */
function suffix(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(6);
  let out = "";
  for (const byte of bytes) out += alphabet[byte % alphabet.length];
  return out;
}

export function buildSlug(name: string): string {
  // filter(Boolean) drops an unusable name cleanly — an all-punctuation one
  // would otherwise leave "prospect--suffix".
  return [PREFIX, kebab(name), suffix()].filter(Boolean).join("-");
}

/**
 * Retries on collision. Unique in practice from the random suffix alone, but the
 * slug column is UNIQUE so a duplicate would otherwise surface as a raw Prisma
 * P2002 in the SDR's face.
 */
export async function buildUniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = buildSlug(name);
    if (!(await exists(slug))) return slug;
  }
  // Astronomically unlikely; fall back to something that cannot collide.
  return `${buildSlug(name)}-${Date.now().toString(36)}`;
}
