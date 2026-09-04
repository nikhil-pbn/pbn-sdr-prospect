import { NextResponse } from "next/server";
import { activeNow, activeOnProspect } from "@/server/analytics/queries";
import { requireAnalyticsAdmin } from "@/server/analytics/access";

/**
 * How many people have a prospect page open right now.
 *
 * Its own endpoint rather than part of the dashboard's render, because the
 * dashboard is five aggregate queries and this is one indexed count — polling
 * the cheap thing every 15 seconds is affordable, polling the expensive thing
 * is not.
 *
 * Admin-only, through the same gate as the pages. This is activity data about
 * named prospects, so it needs exactly the protection the dashboard has.
 */

/** Reads live state; never cached. */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await requireAnalyticsAdmin();
  // 401 rather than a redirect: the caller is `fetch`, not a browser navigation,
  // and it only needs to know to stop asking.
  if (gate.kind !== "ok") {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const prospectId = new URL(request.url).searchParams.get("prospectId");

  // Narrowed at the database when a prospect is named. Same shape either way,
  // with an empty list: the single-prospect view shows a count, never a list.
  if (prospectId) {
    return NextResponse.json({
      open: await activeOnProspect(prospectId),
      prospects: [],
    });
  }

  return NextResponse.json(await activeNow());
}
