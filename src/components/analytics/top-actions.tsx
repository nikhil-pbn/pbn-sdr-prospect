import type { TopAction } from "@/server/analytics/queries";

/**
 * Which calls to action were actually pressed, most first.
 *
 * A bar per action rather than a table: the only question here is relative —
 * which CTA pulls — and a length is read faster than five numbers in a column.
 * Widths are proportions of the top action, not of the total, so the leader
 * always fills the row and the rest are legible against it.
 */
export function TopActions({ actions }: { actions: TopAction[] }) {
  if (actions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No calls to action were clicked in this date range.
      </p>
    );
  }

  const most = actions[0].clicks;

  return (
    <ul className="space-y-2 rounded-xl border bg-card p-5">
      {actions.map((entry) => (
        <li key={entry.action} className="space-y-1">
          <div className="flex items-baseline justify-between gap-4">
            <span className="truncate text-sm font-medium">{entry.action}</span>
            <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
              {entry.clicks}
            </span>
          </div>
          <div
            aria-hidden
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-brand"
              // Inline width because the value is data, not one of a fixed set
              // of classes Tailwind could have generated at build time.
              style={{ width: `${Math.max(4, (entry.clicks / most) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
