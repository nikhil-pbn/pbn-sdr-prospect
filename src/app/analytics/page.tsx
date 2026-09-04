import { Suspense } from "react";
import type { Metadata } from "next";
import { HomeHeader } from "@/components/home/home-header";
import { PAGE_WIDTHS } from "@/utils/page-width";
import { RangeFilter } from "@/components/analytics/range-filter";
import { ViewTabs } from "@/components/analytics/view-tabs";
import { ActiveNow } from "@/components/analytics/active-now";
import { LiveRefresh } from "@/components/analytics/live-refresh";
import {
  AnalyticsReport,
  AnalyticsReportSkeleton,
} from "@/components/analytics/analytics-report";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { requireAnalyticsAdmin } from "@/server/analytics/access";
import { activeNow } from "@/server/analytics/queries";
import { parsePage } from "@/utils/pagination";
import { parseDateRange } from "@/utils/date-range-params";
import { DEFAULT_VIEW, parseView } from "@/utils/analytics-view";
import { ANALYTICS_SORT, ANALYTICS_SORT_DEFAULT } from "@/utils/analytics-sort";
import { parseSort, sortQuery } from "@/utils/table-sort";

/** Aggregates live visits, so never prerendered. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prospect analytics",
  // `robots` comes from the root layout; declaring it here would replace it.
};

export default async function AnalyticsPage(props: PageProps<"/analytics">) {
  const params = await props.searchParams;
  const gate = await requireAnalyticsAdmin();
  if (gate.kind === "signin") {
    return (
      <SignInGate
        reason={typeof params.signin === "string" ? params.signin : undefined}
        path="/analytics"
      />
    );
  }
  if (gate.kind === "refused") return gate.screen;

  // Resolved ONCE, here, and handed to every query. Nothing below reads the
  // query string for itself; that is what keeps the sections from disagreeing.
  const range = parseDateRange(params);
  const view = parseView(params.view);
  const page = parsePage(params.page);
  // Against THIS view's columns: each breakdown is a different table, so a key
  // the selected view has no column for falls back to that view's own default.
  const sort = parseSort(
    params,
    ANALYTICS_SORT[view],
    ANALYTICS_SORT_DEFAULT[view],
  );

  // Carried through the date control so changing the range keeps the breakdown
  // and the ordering you were reading. Not the range itself — the control sets that.
  const carry: Record<string, string> = sortQuery(
    sort,
    ANALYTICS_SORT_DEFAULT[view],
  );
  if (view !== DEFAULT_VIEW) carry.view = view;

  // Rendered server-side once so the first paint already has a number, then
  // kept current by the component's own poll. Not inside the Suspense boundary:
  // presence is about right now and must not wait on five aggregate queries.
  const live = await activeNow();

  return (
    <div className="min-h-full bg-muted/40">
      <HomeHeader user={gate.user} current="analytics" width="wide" />

      <main className={`mx-auto w-full ${PAGE_WIDTHS.wide} px-6 py-10`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Prospect analytics
          </h1>
          <div className="flex items-center gap-4">
            {/* Outside the filtered report on purpose — see ActiveNow for why. */}
            <ActiveNow initial={live} />
            {/* Invisible: re-renders the numbers below every few seconds. */}
            <LiveRefresh />
          </div>
        </div>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          How prospects actually engage with published pages — views, active
          reading time and tracked clicks. Staff visits are excluded.
        </p>

        <RangeFilter range={range} carry={carry} />

        {/* Which single breakdown to show. Below the dates, because the range
            applies to every one of them and so reads as the outer control. */}
        <div className="mt-5">
          <ViewTabs range={range} view={view} />
        </div>

        <div className="mt-8">
          {/* `key` on the range, the view, the page and the sort, so changing
              any of them re-suspends rather than leaving the previous numbers on
              screen while the new aggregation runs. */}
          <Suspense
            key={`${range.key}-${range.from?.getTime() ?? "x"}-${view}-${page}-${sort.key}-${sort.dir}`}
            fallback={
              <AnalyticsReportSkeleton range={range} view={view} sort={sort} />
            }
          >
            <AnalyticsReport
              range={range}
              view={view}
              page={page}
              sort={sort}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
