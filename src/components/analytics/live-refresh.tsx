"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_REFRESH_MS } from "@/utils/analytics-limits";

/**
 * Keeps the dashboard's numbers current without a reload.
 *
 * `router.refresh()` re-runs the page's Server Components — the summary cards
 * and whichever breakdown is showing — against the same URL, so the range, view,
 * sort and page you are looking at never change under you; only the numbers do.
 * React swaps the new render in place, so nothing flashes or scrolls.
 *
 * Paused while the tab is hidden, and refreshed once the moment it is visible
 * again: a dashboard left on a second monitor overnight would otherwise re-run
 * five aggregates every few seconds to show nobody anything.
 *
 * Renders NOTHING. It used to show a pulsing "Live" label, which sat next to the
 * "N prospects open now" pill and read as a second presence indicator — so it
 * looked like somebody was reading when nobody was. The refresh is a property
 * of the page, not a fact about visitors, and needs no marker.
 */
export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    let timer = window.setInterval(
      () => router.refresh(),
      DASHBOARD_REFRESH_MS,
    );

    const onVisibility = () => {
      window.clearInterval(timer);
      if (document.visibilityState !== "visible") return;
      router.refresh();
      timer = window.setInterval(() => router.refresh(), DASHBOARD_REFRESH_MS);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  return null;
}
