"use client";

import { useProspectTracking } from "@/hooks/use-prospect-tracking";

/**
 * The only client component on the public prospect page, and the only thing
 * that measures anything.
 *
 * Mounted by `/[slug]` and NOT by `ProspectRenderer`, which is deliberate and
 * load-bearing: that renderer is also the editor's live preview, so putting the
 * tracker inside it would have every SDR inflating the view count of the page
 * they are editing.
 *
 * Renders nothing, and holds no state. The page is server-rendered and complete
 * before this runs, so tracking cannot delay or block a single pixel of it.
 */
export function ProspectTracker({ slug }: { slug: string }) {
  useProspectTracking(slug);
  return null;
}
