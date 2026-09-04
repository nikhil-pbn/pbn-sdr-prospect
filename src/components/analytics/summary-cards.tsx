import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/utils/duration";
import type { Metrics } from "@/server/analytics/queries";

/**
 * The six headline numbers, in the same card style as the rest of the internal
 * pages.
 *
 * Five of them are the shared `Metrics` and mean the same thing everywhere. The
 * sixth is whatever the page is counting — prospects on the dashboard, visits
 * on one prospect's page — so it is passed in whole rather than derived here.
 *
 * Counts are plain numerals; durations go through `formatDuration`. Nothing
 * here can render NaN — the query guarantees whole numbers and a zero average
 * when there are no visits to divide by.
 */
export function AnalyticsSummaryCards({
  metrics,
  lead,
}: {
  metrics: Metrics;
  /** The first card, which differs per page. */
  lead: { value: number | string; label: string; hint: string };
}) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
      <SummaryCard value={lead.value} label={lead.label} hint={lead.hint} />
      <SummaryCard
        value={metrics.views}
        label="Views"
        hint="every open, refreshes included"
      />
      <SummaryCard
        value={metrics.uniqueViews}
        label="Unique views"
        hint="distinct visitors"
      />
      <SummaryCard
        value={formatDuration(metrics.totalMs)}
        label="Total time"
        hint="active reading only"
      />
      <SummaryCard
        value={formatDuration(metrics.averageMsPerSession)}
        label="Average time"
        hint={`per visit · ${metrics.sessions} ${metrics.sessions === 1 ? "visit" : "visits"}`}
      />
      <SummaryCard
        value={metrics.clicks}
        label="Clicks"
        hint="tracked calls to action"
      />
    </div>
  );
}

function SummaryCard({
  value,
  label,
  hint,
}: {
  value: number | string;
  label: string;
  /** What the number counts. Every one of these six is easy to misread without it. */
  hint: string;
}) {
  return (
    <div className="bg-card p-5">
      <p className="text-3xl font-semibold tracking-tight text-brand tabular-nums">
        {value}
      </p>
      <p className="mt-1 font-medium">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

/**
 * The six cards' frame with grey where the numbers go. Each placeholder sits
 * in a box the height of the line it replaces, so the grid is exactly as tall
 * loading as loaded and nothing below it moves.
 */
export function SummaryCardsSkeleton() {
  return (
    <div
      className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
    >
      {Array.from({ length: 6 }, (_, card) => (
        <div key={card} className="bg-card p-5">
          <div className="flex h-9 items-center">
            <Skeleton className="h-7 w-16" />
          </div>
          <div className="mt-1 flex h-6 items-center">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-0.5 flex h-4 items-center">
            <Skeleton className="h-3 w-32 bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
