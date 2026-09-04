import Link from "next/link";
import { ExternalLink, PencilLine } from "lucide-react";
import { CopyLinkButton } from "@/components/copy-link-button";
import type { ProspectListing } from "@/server/prospect/listing";
import {
  editorPathFor,
  prospectPathFor,
  prospectUrlFor,
} from "@/utils/prospect-url";

const LINK = "inline-flex items-center gap-1.5 text-sm hover:underline";

/**
 * Both routes to a prospect: the live page, and the editor.
 *
 * The editor link is unconditional: another SDR's prospect opens read-only, so
 * anyone reading these tables can open it — only saving is restricted to the
 * owner. The public link appears only once status is Published, because the
 * `/[slug]` route renders nothing before that and the URL would 404.
 *
 * Labels rather than the slug: the name is already a column to the left, so a
 * URL fragment here would repeat what the reader just passed. The full URL is
 * on hover and in the copy button.
 */
export function RowLinks({ row }: { row: ProspectListing }) {
  const published = row.status === "Published";

  return (
    <div className="flex items-center gap-3">
      {published && (
        <span className="flex items-center gap-1">
          <Link
            href={prospectPathFor(row.slug)}
            target="_blank"
            title={prospectUrlFor(row.slug)}
            className={`${LINK} text-brand-accent`}
          >
            <ExternalLink className="size-3.5 shrink-0" aria-hidden />
            Open
          </Link>
          <CopyLinkButton url={prospectUrlFor(row.slug)} />
        </span>
      )}

      <Link
        href={editorPathFor(row.id)}
        title={published ? "Open in the editor" : "Not published yet"}
        className={`${LINK} text-muted-foreground`}
      >
        <PencilLine className="size-3.5 shrink-0" aria-hidden />
        Editor
      </Link>
    </div>
  );
}
