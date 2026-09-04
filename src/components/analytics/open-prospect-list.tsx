"use client";

import Link from "next/link";
import { BarChart3, ExternalLink } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { formatDuration } from "@/utils/duration";
import { prospectPathFor } from "@/utils/prospect-url";
import type { OpenProspect } from "@/server/analytics/queries";

/**
 * What is behind "2 prospects open now".
 *
 * Each entry offers both destinations, because "somebody is reading this"
 * prompts two different questions: the analytics page answers what they are
 * doing, and the live page answers what they are looking at.
 */
export function OpenProspectList({ prospects }: { prospects: OpenProspect[] }) {
  return (
    <PopoverContent align="end" className="w-80 p-0">
      <p className="border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">
        Open right now
      </p>
      <ul className="max-h-80 overflow-y-auto py-1">
        {prospects.map((entry) => (
          <li key={entry.id} className="px-2">
            <div className="rounded-lg px-2 py-2 hover:bg-muted">
              <p className="truncate text-sm font-medium">
                {entry.name}
                {entry.readers > 1 && (
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    · {entry.readers} reading
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {entry.email} · open for{" "}
                {formatDuration(entry.openForSeconds * 1000)}
              </p>
              <div className="mt-1.5 flex gap-3 text-xs">
                <Link
                  href={`/analytics/${entry.id}`}
                  className="inline-flex items-center gap-1 text-brand-accent hover:underline"
                >
                  <BarChart3 className="size-3" aria-hidden />
                  Analytics
                </Link>
                <Link
                  href={prospectPathFor(entry.slug)}
                  target="_blank"
                  prefetch={false}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:underline"
                >
                  <ExternalLink className="size-3" aria-hidden />
                  Live page
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </PopoverContent>
  );
}
