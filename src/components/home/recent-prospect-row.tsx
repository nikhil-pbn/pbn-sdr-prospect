import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyLinkButton } from "@/components/copy-link-button";
import type { RecentProspect } from "@/server/prospect/recent";
import {
  editorPathFor,
  prospectPathFor,
  prospectUrlFor,
  shortSlug,
} from "@/utils/prospect-url";
import { relativeDate } from "@/utils/date";

/**
 * One row of the homepage list.
 *
 * Not one big <Link>: the row holds a second link to the public page, and an
 * <a> can't nest inside an <a>. The name is plain text on purpose — the row's
 * actions live in the buttons at the end.
 */
export function RecentProspectRow({ row }: { row: RecentProspect }) {
  const isPublished = row.status === "Published";

  return (
    <li className="group flex items-center gap-2 px-5 py-4 transition-colors hover:bg-muted/50 sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{row.name}</p>
        <p className="mt-0.5 flex min-w-0 items-center text-sm text-muted-foreground">
          <span className="truncate">{row.ownerName}</span>
          <span className="mx-1.5 shrink-0 text-border">&middot;</span>
          {/* Prefix dropped: it is identical on every row, and truncation would
              spend the whole column on it. `title` keeps the real path one hover
              away. */}
          <span className="truncate font-mono text-xs" title={`/${row.slug}`}>
            {shortSlug(row.slug)}
          </span>
        </p>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-muted-foreground">
          {relativeDate(row.updatedAt)}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground/70">
          v{row.version}
        </p>
      </div>

      <Badge
        variant={isPublished ? "default" : "secondary"}
        className="shrink-0"
      >
        {row.status}
      </Badge>

      {isPublished && (
        <>
          <CopyLinkButton url={prospectUrlFor(row.slug)} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
              >
                <Link
                  href={prospectPathFor(row.slug)}
                  target="_blank"
                  aria-label="Open the page the prospect sees"
                >
                  <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open prospect page</TooltipContent>
          </Tooltip>
        </>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
          >
            <Link href={editorPathFor(row.id)} aria-label="Edit this prospect">
              <Pencil className="size-3.5" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>
    </li>
  );
}
