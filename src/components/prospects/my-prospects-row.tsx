import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { HubspotCell } from "./hubspot-cell";
import { RowActions } from "./row-actions";
import { RowLinks } from "./row-links";
import type { ProspectListing } from "@/server/prospect/listing";
import { STORED_MODE_LABELS } from "@/lib/prospect-options";
import { formatLongDate, relativeDate } from "@/utils/date";

/**
 * One prospect, with everything the database knows about it.
 *
 * Detail sits as small secondary text under each value rather than in its own
 * column — a dozen columns is not a table anyone reads, and the dates and the
 * contact address are things you want when you look at a row, not while
 * scanning down one.
 */
export function MyProspectsRow({
  row,
  hubspotEnabled,
}: {
  row: ProspectListing;
  hubspotEnabled: boolean;
}) {
  const published = row.status === "Published";

  return (
    <TableRow>
      <TableCell className="font-medium">
        {row.name}
        <span className="block text-xs font-normal text-muted-foreground">
          {row.email}
        </span>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {row.prospectRole || "—"}
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {STORED_MODE_LABELS[row.mode]}
      </TableCell>

      <TableCell>
        <Badge variant={published ? "default" : "secondary"}>
          {row.status}
        </Badge>
        <span className="mt-1 block text-xs text-muted-foreground">
          {/* A draft's link exists but 404s — the slug is minted at generation,
              so "published" is the only thing that decides whether it resolves. */}
          {published && row.publishedAt
            ? formatLongDate(row.publishedAt)
            : "link not live"}
        </span>
      </TableCell>

      <TableCell>
        <HubspotCell row={row} />
      </TableCell>

      <TableCell className="text-sm">
        {row.trackingConfirmedAt ? (
          <span className="inline-flex items-center gap-1">
            <Check
              className="size-3.5 shrink-0 text-brand-accent"
              aria-hidden
            />
            <span className="text-xs text-muted-foreground">
              {formatLongDate(row.trackingConfirmedAt)}
            </span>
          </span>
        ) : (
          // Not a cross: a draft has not reached the dialog yet, and that is not
          // a fault.
          <span className="text-muted-foreground" title="Not confirmed yet">
            —
          </span>
        )}
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {/* From the analytics events, stamped on the first View of each visit.
            Null for a page nobody has opened — which for a published one is
            itself the finding. */}
        {row.lastViewedAt ? relativeDate(row.lastViewedAt) : "—"}
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {formatLongDate(row.createdAt)}
        <span className="block text-xs">
          edited {formatLongDate(row.updatedAt)} · v{row.version}
        </span>
      </TableCell>

      <TableCell>
        <RowLinks row={row} />
      </TableCell>

      <TableCell>
        <RowActions row={row} hubspotEnabled={hubspotEnabled} />
      </TableCell>
    </TableRow>
  );
}
