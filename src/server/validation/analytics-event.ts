/**
 * The only shape the public ingestion endpoint will accept.
 *
 * Deliberately tiny. The browser is an untrusted caller, so it sends the slug of
 * the page it is on and nothing else identifying — no prospect id, no owner, no
 * role. Those are resolved server-side from the slug, which is what stops a
 * caller attributing views to somebody else's prospect.
 */

import { z } from "zod";
import {
  ABSURD_DURATION_MS,
  MAX_ACTION_LENGTH,
  MAX_SEQ,
} from "@/utils/analytics-limits";

export const analyticsEventInput = z.object({
  /** Which prospect, by its public slug — the one thing the client legitimately knows. */
  slug: z.string().trim().min(1).max(255),

  /**
   * `Closed` is the goodbye, sent by the pagehide beacon when the visitor closes
   * the tab or navigates away. It carries the final slice of reading time AND
   * marks the visit closed, as one request — two beacons at unload is a race.
   */
  type: z.enum(["View", "Heartbeat", "Click", "Closed"]),

  /**
   * Monotonic stamp for a heartbeat: epoch seconds at the moment it was measured.
   * The visit row keeps the highest stamp it has applied and ignores anything not
   * greater, so a captured beacon replayed later cannot add its time twice.
   */
  seq: z.number().int().min(1).max(MAX_SEQ),

  /**
   * Active milliseconds for a Heartbeat or Closed. Bounded here only against the
   * absurd — a day — and CLAMPED to the honest per-beat maximum when recorded.
   */
  durationMs: z.number().int().min(0).max(ABSURD_DURATION_MS).optional(),

  /** The CTA label for a Click. Opaque text; never a URL and never about the person. */
  action: z.string().trim().min(1).max(MAX_ACTION_LENGTH).optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventInput>;
