import { MAX_ACTION_LENGTH } from "@/utils/analytics-limits";
import {
  sendBeaconEvent,
  type TrackedEvent,
} from "@/components/analytics/send-event";

/**
 * One delegated listener for every tracked call to action on the page.
 *
 * Delegated from `document` rather than wired per button, which is what keeps
 * the whole prospect page as Server Components: a CTA opts in with a
 * `data-analytics-click` label and needs no JavaScript of its own.
 *
 * Capture phase, so a click still registers if something downstream stops
 * propagation. A beacon rather than a fetch because a CTA navigates away
 * immediately, and a fetch in flight at that moment is cancelled.
 */
export function clickReporter(
  next: (event: Omit<TrackedEvent, "slug" | "seq">) => TrackedEvent,
) {
  return (nativeEvent: MouseEvent) => {
    const target = nativeEvent.target as HTMLElement | null;
    const el = target?.closest<HTMLElement>("[data-analytics-click]");
    const action = el?.dataset.analyticsClick?.trim();
    // Only labelled elements, never every DOM click. Truncated because the label
    // comes from SDR-edited CTA text, and an over-long one would fail validation
    // server-side and lose the click altogether.
    if (!action) return;
    sendBeaconEvent(
      next({ type: "Click", action: action.slice(0, MAX_ACTION_LENGTH) }),
    );
  };
}
