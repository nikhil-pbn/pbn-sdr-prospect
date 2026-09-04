import "server-only";
import { cookies } from "next/headers";
import { cookieBaseOptions } from "@/server/auth/config";
import {
  VISIT_COOKIE,
  VISIT_MAX_AGE_SECONDS,
  VISITOR_COOKIE,
  VISITOR_MAX_AGE_SECONDS,
} from "./config";

/**
 * Anonymous first-party identity for a public visitor.
 *
 * Two httpOnly cookies, both issued by this server and both meaningless outside
 * it. httpOnly is the important part: page scripts cannot read or forge them,
 * and the browser attaches them automatically, so the tracker never has to send
 * an identity at all. Nothing is derived from IP, user agent or any fingerprint,
 * and neither value says anything about who the person is — the visitor id
 * exists solely so that pressing refresh is not counted as a second human being.
 */

export type VisitorIdentity = {
  visitorId: string;
  sessionId: string;
  /** Which cookies this request has to (re)issue on the response. */
  issue: { visitor: boolean; visit: boolean };
};

/** A stored id is only usable if it is still a UUID — anything else is rewritten. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function valid(value: string | undefined): string | null {
  return value && UUID.test(value) ? value.toLowerCase() : null;
}

/**
 * Read the identity from the request, minting whatever is missing.
 *
 * The session cookie is always reissued, not just when absent: that is what
 * makes its 30 minutes SLIDE, so a long read stays one session instead of
 * splitting in half at the half-hour mark.
 */
export async function readVisitor(): Promise<VisitorIdentity> {
  const jar = await cookies();
  const existingVisitor = valid(jar.get(VISITOR_COOKIE)?.value);
  const existingVisit = valid(jar.get(VISIT_COOKIE)?.value);

  return {
    visitorId: existingVisitor ?? crypto.randomUUID(),
    sessionId: existingVisit ?? crypto.randomUUID(),
    issue: { visitor: !existingVisitor, visit: true },
  };
}

/**
 * Options for the two Set-Cookie headers. Built on `cookieBaseOptions` so these
 * share the sign-in cookie's httpOnly, secure-in-production and SameSite=Lax
 * settings. Lax is right here too: a prospect usually arrives from an email
 * client or Slack, which is a cross-site navigation.
 */
export function visitorCookieOptions() {
  return { ...cookieBaseOptions(), maxAge: VISITOR_MAX_AGE_SECONDS };
}

export function visitCookieOptions() {
  return { ...cookieBaseOptions(), maxAge: VISIT_MAX_AGE_SECONDS };
}
