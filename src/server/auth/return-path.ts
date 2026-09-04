import "server-only";

/**
 * Sanitises the page to return to after signing in.
 *
 * The path makes a round trip through the browser — it is a query parameter on
 * the way out and a cookie on the way back — so it arrives as attacker-editable
 * input, and it is then fed to a redirect. Handing it straight to `redirect()`
 * would make the sign-in flow an open redirect: a link to
 * `/api/auth/google/signin?next=https://not-us.example` would bounce an
 * employee off-site immediately after they authenticate.
 *
 * So the only thing accepted is a path on this site. Anything else silently
 * becomes "/" rather than erroring — a bad value is not worth a dead end in
 * front of someone who is only trying to sign in.
 */

const FALLBACK = "/";

/** A pasted URL with a long query has no business here. */
const MAX_LENGTH = 512;

export function safeReturnPath(value: string | null | undefined): string {
  if (!value || value.length > MAX_LENGTH) return FALLBACK;
  if (!value.startsWith("/")) return FALLBACK;

  // "//host" and "/\host" are protocol-relative: the browser reads them as
  // another origin, and they start with "/" so the check above waves them past.
  if (/^[/\\]{2}/.test(value)) return FALLBACK;

  // Parsed against a throwaway origin purely to split path from query and drop
  // any fragment. The origin is never used.
  let url: URL;
  try {
    url = new URL(value, "http://localhost");
  } catch {
    return FALLBACK;
  }

  // Drop our own marker so an error from a previous attempt is not still on the
  // URL after a later one succeeds.
  url.searchParams.delete("signin");

  const query = url.searchParams.toString();
  return `${url.pathname}${query ? `?${query}` : ""}`;
}
