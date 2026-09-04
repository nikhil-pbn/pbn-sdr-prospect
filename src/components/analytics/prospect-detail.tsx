import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DbUnreachableNotice } from "@/components/notices/db-unreachable-notice";
import { AnalyticsSummaryCards, SummaryCardsSkeleton } from "./summary-cards";
import { TopActions } from "./top-actions";
import { SectionHeading } from "./section-heading";
import {
  prospectDetailAnalytics,
  type ProspectIdentity,
} from "@/server/analytics/queries";
import { prospectPathFor, prospectUrlFor } from "@/utils/prospect-url";
import { relativeDate } from "@/utils/date";
import { rangeQuery } from "@/utils/date-range-params";
import type { DateRange } from "@/utils/date-range";

/**
 * One prospect's engagement, plus which CTAs the reader actually pressed.
 *
 * Reuses the dashboard's summary cards rather than laying out six more: the
 * numbers mean exactly the same thing here, scoped to one prospect, and two
 * visual languages for one set of metrics is how a dashboard starts lying.
 */
export async function ProspectAnalyticsDetail({
  prospect,
  range,
}: {
  prospect: ProspectIdentity;
  range: DateRange;
}) {
  let detail: Awaited<ReturnType<typeof prospectDetailAnalytics>>;
  try {
    detail = await prospectDetailAnalytics({ range, prospectId: prospect.id });
  } catch (caught) {
    unstable_rethrow(caught);
    return (
      <DbUnreachableNotice
        className="rounded-lg border bg-muted/40 p-5"
        detail={caught instanceof Error ? caught.message : undefined}
      />
    );
  }

  const published = prospect.status === "Published";

  return (
    <>
      <AnalyticsSummaryCards
        metrics={detail}
        lead={{
          value: detail.sessions,
          label: "Visits",
          hint: `${detail.returningVisitors} returning visitor${detail.returningVisitors === 1 ? "" : "s"}`,
        }}
      />

      <p className="mt-4 text-sm text-muted-foreground">
        {detail.lastViewedAt
          ? `Last opened ${relativeDate(detail.lastViewedAt)}.`
          : published
            ? "Nobody has opened this page yet."
            : "Not published, so it has no public page to open."}
      </p>

      <Separator className="my-10" />

      <SectionHeading>Top clicked actions</SectionHeading>
      <TopActions actions={detail.topActions} />

      <div className="mt-10 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/analytics?${new URLSearchParams(rangeQuery(range))}`}>
            <ArrowLeft className="size-3.5" />
            All prospects
          </Link>
        </Button>
        {published && (
          <Button asChild variant="outline" size="sm">
            <Link
              href={prospectPathFor(prospect.slug)}
              target="_blank"
              title={prospectUrlFor(prospect.slug)}
            >
              <ExternalLink className="size-3.5" />
              Open the page
            </Link>
          </Button>
        )}
      </div>
    </>
  );
}

/** Label widths for the placeholder bars, so three rows read as three actions. */
const ACTION_WIDTHS = ["w-40", "w-32", "w-36"];

/**
 * The detail page's shape while its query runs: the six cards, the "last
 * opened" line, and the top-actions list as grey bars — the shape the answer
 * will take, not a spinner where it will go.
 */
export function ProspectDetailSkeleton() {
  return (
    <>
      <SummaryCardsSkeleton />

      <div className="mt-4 flex h-5 items-center">
        <Skeleton className="h-4 w-48" />
      </div>

      <Separator className="my-10" />

      <SectionHeading>Top clicked actions</SectionHeading>
      <ul className="space-y-2 rounded-xl border bg-card p-5" aria-busy="true">
        {ACTION_WIDTHS.map((width) => (
          <li key={width} className="space-y-1">
            <div className="flex h-5 items-center justify-between gap-4">
              <Skeleton className={`h-4 ${width}`} />
              <Skeleton className="h-4 w-6" />
            </div>
            <Skeleton className="h-1.5 rounded-full" />
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-2">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>
    </>
  );
}
