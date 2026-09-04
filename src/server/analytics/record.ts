import "server-only";
import { prisma, ProspectStatus } from "@/server/db";
import { MAX_HEARTBEAT_MS } from "@/utils/analytics-limits";
import type { AnalyticsEventInput } from "@/server/validation/analytics-event";
import { touchVisit } from "./touch-visit";

/**
 * Folds one reported activity into this visitor's single visit row.
 *
 * The security boundary lives here. The caller is an unauthenticated browser, so
 * the ONLY identifying thing it may supply is the slug of the page it is on: the
 * prospect is looked up from that, and the SDR and role are never accepted
 * from the client at all — they are joined from `prospects` when the dashboard
 * is read. There is therefore no request a visitor can craft that attributes
 * their activity to a different prospect, SDR or role.
 *
 * Drafts are refused as firmly as missing slugs, and for the same reason the
 * public page 404s them: an unpublished prospect is not public, and letting it
 * accumulate analytics would leak that it exists.
 */

export type RecordOutcome = "recorded" | "ignored" | "rejected";

export async function recordAnalyticsEvent(input: {
  event: AnalyticsEventInput;
  visitorId: string;
  sessionId: string;
  /** The request carried a valid staff session. */
  signedIn: boolean;
}): Promise<RecordOutcome> {
  const { event, visitorId, sessionId, signedIn } = input;

  // The rule, and the first thing checked: anyone signed in generates no
  // analytics at all. Not recorded-and-filtered — refused. An SDR opening their
  // own page to proofread it must leave no trace, and enforcing that at the door
  // means no query written later can forget to exclude them.
  if (signedIn) return "rejected";

  const prospect = await prisma.prospect.findUnique({
    where: { slug: event.slug },
    select: { id: true, status: true },
  });
  if (!prospect || prospect.status !== ProspectStatus.Published) {
    return "rejected";
  }

  // A click with no label is nothing to record; the tracker only sends labelled ones.
  if (event.type === "Click" && !event.action) return "rejected";

  // Clamped, not rejected: a beat delayed by a throttled tab honestly measured
  // more than the interval, and dropping it would lose real reading time. The
  // absurd values are already gone — validation refused anything over a day.
  const carriesTime = event.type === "Heartbeat" || event.type === "Closed";
  const durationMs = carriesTime
    ? Math.min(event.durationMs ?? 0, MAX_HEARTBEAT_MS)
    : 0;

  const applied = await touchVisit({
    prospectId: prospect.id,
    visitorId,
    sessionId,
    kind: event.type,
    durationMs,
    action: event.action,
    beatSeq: event.seq,
  });

  // A View is what means "the prospect opened it", so it is what stamps the row.
  if (applied && event.type === "View") await stampLastViewed(prospect.id);

  return applied ? "recorded" : "ignored";
}

/**
 * Raw SQL on purpose. `prisma.prospect.update()` would also touch `updatedAt`,
 * which carries `@updatedAt` — so every visitor opening a page would make it
 * look freshly edited in the listings, which read that column.
 */
async function stampLastViewed(prospectId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE prospects SET last_viewed_at = NOW() WHERE id = ${prospectId}::uuid
  `;
}
