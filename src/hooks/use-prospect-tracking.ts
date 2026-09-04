"use client";

import { useEffect, useRef } from "react";
import { HEARTBEAT_INTERVAL_MS } from "@/utils/analytics-limits";
import {
  sendFetchEvent,
  sendBeaconEvent,
  type TrackedEvent,
} from "@/components/analytics/send-event";
import { clickReporter } from "./click-reporter";

/**
 * Everything the public prospect page measures, and when it reports it.
 *
 * Two signals come out of one tick, and keeping them apart is the whole design:
 *
 *  - PRESENCE. The ping fires whether or not the tab is visible, so a page
 *    parked in a background tab still counts as open — which is what "active
 *    now" means here.
 *  - READING TIME. Only time with the tab actually in front of someone is
 *    reported, so a page left open overnight is not eight hours of reading.
 */

/**
 * Slugs whose VIEW has already been reported in this page load.
 *
 * Module scope on purpose: React Strict Mode mounts, unmounts and remounts
 * every effect in development, which would otherwise double every view. Module
 * state survives that remount where a ref does not, and it does NOT survive a
 * refresh — which is correct, because a refresh IS a second view.
 *
 * It suppresses ONLY the view. The remount still attaches the listeners and the
 * heartbeat.
 */
const viewed = new Set<string>();

/** Below a second is not reading time worth reporting. */
const MIN_REPORTABLE_MS = 1_000;

export function useProspectTracking(slug: string): void {
  // Every mutable value lives in a ref: the calling component never re-renders,
  // and a state update would be a wasted render on an otherwise static page.
  const bankedMs = useRef(0);
  const activeSince = useRef<number | null>(null);

  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;

    /**
     * `seq` is epoch SECONDS, not a counter. The server keeps the highest stamp
     * a visit has applied and ignores anything not greater. A per-page-load
     * counter restarts at 1, so after a refresh inside the same 30-minute visit
     * every beat would look like a replay. Seconds keep rising across reloads
     * and across tabs.
     */
    const next = (event: Omit<TrackedEvent, "slug" | "seq">): TrackedEvent => ({
      slug,
      seq: Math.floor(Date.now() / 1000),
      ...event,
    });

    /** Visible milliseconds since the last report, including the open stretch. */
    const pending = () =>
      bankedMs.current +
      (activeSince.current === null ? 0 : Date.now() - activeSince.current);

    /**
     * Report presence, and whatever reading time has accrued with it. Sent even
     * when the duration is zero — a hidden tab accrues no reading time but is
     * still open, and skipping the request would make it vanish from "active
     * now" once the activity window elapsed.
     */
    const report = (kind: "Heartbeat" | "Closed", useBeacon: boolean) => {
      const accrued = pending();
      const durationMs = accrued >= MIN_REPORTABLE_MS ? accrued : 0;
      if (durationMs > 0) {
        bankedMs.current = 0;
        activeSince.current = activeSince.current === null ? null : Date.now();
      }
      const event = next({ type: kind, durationMs });
      if (useBeacon) sendBeaconEvent(event);
      else void sendFetchEvent(event);
    };

    // Only time with the tab in front of someone counts toward reading time.
    // The interval is NOT cleared here: presence keeps being reported while hidden.
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        activeSince.current = Date.now();
      } else {
        bankedMs.current = pending();
        activeSince.current = null;
        // Banked and sent before the tab is buried, in case it is never returned to.
        report("Heartbeat", true);
      }
    };

    const onClick = clickReporter(next);

    /**
     * The goodbye. `pagehide` fires when the tab closes AND when the visitor
     * navigates away, which includes following a tracked CTA — so leaving the
     * page drops them out of "active now" at once. It is also the only reliable
     * hook: `unload` is ignored by modern browsers and `beforeunload` breaks the
     * back-forward cache.
     */
    const onPageHide = () => report("Closed", true);

    async function start(reportView: boolean) {
      // Awaited so the view's reply installs the cookies before anything else is
      // sent. Without it a fast click could arrive cookie-less and be attributed
      // to a second, phantom visitor.
      if (reportView) await sendFetchEvent(next({ type: "View" }));
      if (stopped) return;

      if (document.visibilityState === "visible") {
        activeSince.current = Date.now();
      }
      document.addEventListener("visibilitychange", onVisibility);
      document.addEventListener("click", onClick, true);
      window.addEventListener("pagehide", onPageHide);
      timer = window.setInterval(
        () => report("Heartbeat", false),
        HEARTBEAT_INTERVAL_MS,
      );
    }

    const firstMount = !viewed.has(slug);
    viewed.add(slug);
    void start(firstMount);

    return () => {
      stopped = true;
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [slug]);
}
