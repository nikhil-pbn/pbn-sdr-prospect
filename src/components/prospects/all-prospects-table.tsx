import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TableHeadRow, type HeadColumn } from "@/components/table-head-row";
import { Badge } from "@/components/ui/badge";
import { HubspotCell } from "./hubspot-cell";
import { RowActions } from "./row-actions";
import { RowLinks } from "./row-links";
import type { ProspectListing } from "@/server/prospect/listing";
import { STORED_MODE_LABELS } from "@/lib/prospect-options";
import { sdrByEmail } from "@/utils/sdr-roster";
import { formatLongDate } from "@/utils/date";
import { PROSPECT_SORT } from "@/utils/prospect-sort";
import type { Sort } from "@/utils/table-sort";

/** Exported for the page's loading skeleton, which draws the same header. */
export const ALL_PROSPECTS_COLUMNS: HeadColumn[] = [
  { key: "name", label: "Prospect", className: "min-w-44" },
  { key: "email", label: "Email", className: "min-w-44" },
  { key: "role", label: "Role", className: "min-w-32" },
  { key: "owner", label: "Created by", className: "min-w-36" },
  { key: "mode", label: "Built from", className: "min-w-36" },
  { key: "created", label: "Created", className: "min-w-32" },
  { key: "status", label: "Status", className: "min-w-24", skeleton: "badge" },
  {
    key: "hubspot",
    label: "HubSpot",
    className: "min-w-28",
    skeleton: "badge",
  },
  // No key: two links and a copy button have no order to be in.
  { label: "Links", className: "min-w-40", skeleton: "buttons" },
  {
    label: "Actions",
    className: "min-w-44",
    align: "right",
    skeleton: "buttons",
  },
];

/** The SDR's roster name where we know it, falling back to the session name. */
function ownerLabel(row: ProspectListing): string {
  return sdrByEmail(row.ownerEmail)?.name || row.ownerName || row.ownerEmail;
}

/**
 * The team directory: every prospect, who made it, when, and the link.
 *
 * Admin only — the page gates on `isAdmin` before rendering this, so every row
 * is one the reader may publish or unpublish, and the actions column is
 * unconditional.
 */
export function AllProspectsTable({
  rows,
  sort,
  hubspotEnabled,
}: {
  rows: ProspectListing[];
  /** Which column the rows arrived ordered by — the headers only display it. */
  sort: Sort;
  hubspotEnabled: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No prospects yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeadRow
          columns={ALL_PROSPECTS_COLUMNS}
          sortable={PROSPECT_SORT}
          sort={sort}
          basePath="/all-prospects"
        />
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {row.email}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.prospectRole || "—"}
              </TableCell>
              <TableCell title={row.ownerEmail}>{ownerLabel(row)}</TableCell>
              <TableCell className="text-muted-foreground">
                {STORED_MODE_LABELS[row.mode]}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatLongDate(row.createdAt)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={row.status === "Published" ? "default" : "secondary"}
                >
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell>
                <HubspotCell row={row} />
              </TableCell>
              <TableCell>
                <RowLinks row={row} />
              </TableCell>
              <TableCell>
                <RowActions row={row} hubspotEnabled={hubspotEnabled} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
