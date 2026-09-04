/**
 * How a tracked event leaves the browser.
 *
 * Two transports, chosen by whether the page is about to disappear:
 *
 *  - `fetch` for the initial view and for heartbeats, because the response is
 *    what installs the visitor and session cookies, and because a real request
 *    is visible in devtools when something needs debugging.
 *  - `navigator.sendBeacon` for clicks and for the goodbye, because both race a
 *    navigation. A CTA click unloads the page immediately afterwards, and a
 *    `fetch` in flight at that moment is cancelled. A beacon is handed to the
 *    browser and survives the page.
 *
 * Everything is fire-and-forget and everything swallows its own failure.
 * Nothing on the page may break because analytics is down.
 */

export type TrackedEvent = {
  slug: string;
  type: "View" | "Heartbeat" | "Click" | "Closed";
  seq: number;
  durationMs?: number;
  action?: string;
};

const ENDPOINT = "/api/analytics/event";

export function sendBeaconEvent(event: TrackedEvent): void {
  try {
    // A typed Blob, so the request arrives as JSON rather than as the plain text
    // sendBeacon would otherwise default to — the route parses JSON.
    const body = new Blob([JSON.stringify(event)], {
      type: "application/json",
    });
    navigator.sendBeacon(ENDPOINT, body);
  } catch {
    // Ignored: see the note above.
  }
}

export async function sendFetchEvent(event: TrackedEvent): Promise<void> {
  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      // Same-origin so the httpOnly cookies ride along and can be set in reply.
      credentials: "same-origin",
      // Lets the request outlive the page if one is still open at unload.
      keepalive: true,
    });
  } catch {
    // Ignored: see the note above.
  }
}
