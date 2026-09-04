"use client";

import { useEffect, useState } from "react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { ACTIVE_POLL_MS } from "@/utils/analytics-limits";
import { OpenProspectList } from "./open-prospect-list";
import type { ActiveNow as ActiveNowData } from "@/server/analytics/queries";

/**
 * "2 prospects open now" — the one thing on the page that is about this second.
 *
 * Polls its own small endpoint rather than refreshing the dashboard: presence
 * is a single indexed lookup, so asking every 15 seconds is nearly free, where
 * re-running five aggregates that often would not be.
 *
 * Deliberately ignores the date filter, and is rendered outside the filtered
 * block for that reason. Stops while the tab is hidden and asks once on return.
 */
export function ActiveNow({
  /** Scope to one prospect. Omitted on the dashboard, where it lists them all. */
  prospectId,
  /** Server-rendered starting value, so the first paint is not blank. */
  initial,
}: {
  prospectId?: string;
  initial: ActiveNowData;
}) {
  const [live, setLive] = useState(initial);
  // An error leaves the last known value on screen rather than flashing a zero,
  // which would read as "nobody is reading" when it means "we could not ask".
  const [reachable, setReachable] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const url = prospectId
      ? `/api/analytics/active?prospectId=${encodeURIComponent(prospectId)}`
      : "/api/analytics/active";

    const poll = async () => {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(String(response.status));
        const data: ActiveNowData = await response.json();
        if (cancelled) return;
        setLive(data);
        setReachable(true);
      } catch {
        // Swallowed: a presence count is the least important thing on this
        // page, and an error boundary here would take the dashboard down with it.
        if (!cancelled) setReachable(false);
      }
    };

    let timer = window.setInterval(poll, ACTIVE_POLL_MS);
    const onVisibility = () => {
      window.clearInterval(timer);
      if (document.visibilityState !== "visible") return;
      void poll();
      timer = window.setInterval(poll, ACTIVE_POLL_MS);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [prospectId]);

  // Nothing on screen when nobody is reading. The poller above keeps running —
  // hooks run before this line — so the indicator appears by itself the moment
  // someone opens a page.
  if (live.open === 0) return null;

  const label = prospectId
    ? `${live.open} reading now`
    : `${live.open} ${live.open === 1 ? "prospect" : "prospects"} open now`;

  const dot = (
    <span className="relative flex size-2" aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-success opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-brand-success" />
    </span>
  );

  // No list to open on a single prospect's page — it would be a list of that
  // one prospect, which tells the reader nothing they are not already looking at.
  if (prospectId) {
    return (
      <div aria-live="polite" className="flex items-center gap-2 text-xs">
        {dot}
        <span className="font-medium">{label}</span>
        {!reachable && (
          <span className="text-muted-foreground">· last known</span>
        )}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-live="polite"
        className="flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {dot}
        {label}
        {!reachable && (
          <span className="font-normal text-muted-foreground">
            · last known
          </span>
        )}
      </PopoverTrigger>

      <OpenProspectList prospects={live.prospects} />
    </Popover>
  );
}
