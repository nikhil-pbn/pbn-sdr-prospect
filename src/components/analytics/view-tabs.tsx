import Link from "next/link";
import { BarChart3, CalendarDays, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  VIEW_KEYS,
  VIEW_LABELS,
  analyticsQuery,
  type AnalyticsView,
} from "@/utils/analytics-view";
import type { DateRange } from "@/utils/date-range";

/**
 * Which breakdown to show. One table at a time.
 *
 * Links, not a client-side toggle, matching the date filter: switching view is
 * a navigation, the aggregation re-runs in Postgres, and a view of a range is a
 * URL that can be bookmarked. It also means the report can run ONLY the query
 * behind the selected view instead of all three.
 *
 * Each link carries the active range and drops `page`, so switching table
 * starts at its first page.
 */

const ICONS: Record<AnalyticsView, typeof BarChart3> = {
  prospects: BarChart3,
  sdr: UserRound,
  date: CalendarDays,
};

export function ViewTabs({
  range,
  view,
}: {
  range: DateRange;
  view: AnalyticsView;
}) {
  return (
    <div
      // A tablist in spirit, but these are real links and not ARIA tabs: the
      // panel is a fresh server render, not hidden markup.
      aria-label="Choose a breakdown"
      className="flex flex-wrap gap-1.5"
    >
      {VIEW_KEYS.map((key) => {
        const Icon = ICONS[key];
        const active = key === view;
        const params = new URLSearchParams(analyticsQuery(range, key));
        const search = params.toString();

        return (
          <Button
            key={key}
            asChild
            size="sm"
            variant={active ? "default" : "outline"}
          >
            <Link
              href={search ? `/analytics?${search}` : "/analytics"}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-3.5" />
              {VIEW_LABELS[key]}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
