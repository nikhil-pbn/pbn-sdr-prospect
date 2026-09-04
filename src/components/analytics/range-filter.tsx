import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RANGE_KEYS, RANGE_LABELS, type DateRange } from "@/utils/date-range";
import { toCivilDateInput } from "@/utils/date-range-params";

/**
 * The dashboard's single date filter.
 *
 * Presets are LINKS and the custom range is a plain GET form, so the whole
 * control works with no client JavaScript and no state: picking a range is a
 * navigation, the aggregation re-runs in Postgres, and the result is a URL that
 * can be bookmarked or pasted to a colleague. It is also why every section
 * below can only ever show one range — they all read the same query string.
 *
 * Neither the links nor the form carries `page`, which resets pagination on a
 * range change.
 */
export function RangeFilter({
  range,
  basePath = "/analytics",
  carry,
}: {
  range: DateRange;
  /** Where the preset links point — the dashboard, or one prospect's page. */
  basePath?: string;
  /**
   * Everything that must survive a range change: which breakdown is showing,
   * and how it is sorted. Absent on a single prospect's page, which has neither.
   * Deliberately not the range itself — the links and the form each set that.
   */
  carry?: Record<string, string>;
}) {
  const presets = RANGE_KEYS.filter((key) => key !== "custom");
  const carried = Object.entries(carry ?? {});
  const suffix = carried.map(([key, value]) => `&${key}=${value}`).join("");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {presets.map((key) => (
          <Button
            key={key}
            asChild
            size="sm"
            variant={range.key === key ? "default" : "outline"}
          >
            <Link
              href={`${basePath}?range=${key}${suffix}`}
              aria-current={range.key === key ? "true" : undefined}
            >
              {RANGE_LABELS[key]}
            </Link>
          </Button>
        ))}
      </div>

      <form method="get" className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="range" value="custom" />
        {/* A GET form only submits its own fields, so anything being carried has
            to ride along as a hidden input or applying a custom range would drop it. */}
        {carried.map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <label className="text-xs font-medium text-muted-foreground">
          From
          <Input
            type="date"
            name="from"
            // Pre-filled from the active range so switching to a custom range
            // starts from what is already on screen rather than from blank.
            defaultValue={range.from ? toCivilDateInput(range.from) : ""}
            className="mt-1 h-9 w-40"
          />
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          To
          <Input
            type="date"
            name="to"
            // The stored end is exclusive; show the inclusive day that was picked.
            defaultValue={
              range.to ? toCivilDateInput(new Date(range.to.getTime() - 1)) : ""
            }
            className="mt-1 h-9 w-40"
          />
        </label>
        <Button
          type="submit"
          size="sm"
          variant={range.key === "custom" ? "default" : "outline"}
        >
          Apply range
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium">{range.label}</span>
        {range.from && range.to
          ? ` · ${toCivilDateInput(range.from)} to ${toCivilDateInput(new Date(range.to.getTime() - 1))} (IST)`
          : " · every event ever recorded"}
      </p>
    </div>
  );
}
