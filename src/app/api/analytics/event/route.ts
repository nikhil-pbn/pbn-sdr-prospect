import { NextResponse } from "next/server";
import { analyticsEventInput } from "@/server/validation/analytics-event";
import { recordAnalyticsEvent } from "@/server/analytics/record";
import {
  readVisitor,
  visitCookieOptions,
  visitorCookieOptions,
} from "@/server/analytics/visitor";
import { VISIT_COOKIE, VISITOR_COOKIE } from "@/server/analytics/config";
import { getCurrentUser } from "@/server/auth/current-user";

/**
 * Public ingestion for prospect analytics.
 *
 * Deliberately unauthenticated: the whole point is that a prospect opens a link
 * and reads it, with no account and no friction. The protection is that the
 * endpoint accepts almost nothing — a slug, an event type, a counter — and
 * derives everything that matters server-side. See `server/analytics/record`.
 *
 * A route handler rather than a Server Action because the tracker has to be
 * able to send its final beat with `navigator.sendBeacon`, which posts to a URL
 * and is the only mechanism that survives the page being closed.
 *
 * Every failure answers 204 with an empty body. Nothing on the client reads the
 * response, and a beacon cannot read one at all, so a status code here is only
 * ever a hint to an attacker probing which slugs exist. The one exception is a
 * malformed body, which gets a 400 so a mistake in the tracker is visible in dev.
 */

/** Reads cookies and writes; never cached. */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed body." }, { status: 400 });
  }

  const parsed = analyticsEventInput.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }

  const visitor = await readVisitor();

  // The rule: anyone signed in generates no analytics at all. Refused rather
  // than recorded-and-filtered, so an SDR proofreading their own page leaves no
  // trace and no later query has to remember to exclude them.
  const staff = await getCurrentUser();

  const response = new NextResponse(null, { status: 204 });
  if (visitor.issue.visitor) {
    response.cookies.set(
      VISITOR_COOKIE,
      visitor.visitorId,
      visitorCookieOptions(),
    );
  }
  // Always reissued, so the 30-minute session window slides with activity.
  response.cookies.set(VISIT_COOKIE, visitor.sessionId, visitCookieOptions());

  try {
    await recordAnalyticsEvent({
      event: parsed.data,
      visitorId: visitor.visitorId,
      sessionId: visitor.sessionId,
      signedIn: Boolean(staff),
    });
  } catch (error) {
    // Swallowed on purpose. A dead database must not turn into a visible error
    // on a page a prospect is reading — analytics is the least important thing
    // happening there. Logged so it is not invisible to us.
    console.error("[analytics] failed to record event", error);
  }

  return response;
}
