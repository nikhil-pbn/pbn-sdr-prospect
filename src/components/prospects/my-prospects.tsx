import { Table, TableBody } from "@/components/ui/table";
import { TableHeadRow, type HeadColumn } from "@/components/table-head-row";
import { TableSkeleton } from "@/components/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { DbUnreachableNotice } from "@/components/notices/db-unreachable-notice";
import { TablePagination } from "@/components/table-pagination";
import { hasHubspotToken } from "@/server/hubspot/client";
import { loadProspectListing } from "@/server/prospect/listing";
import { PROSPECT_SORT, PROSPECT_SORT_DEFAULT } from "@/utils/prospect-sort";
import { isDefaultSort, sortQuery, type Sort } from "@/utils/table-sort";
import { MyProspectsRow } from "./my-prospects-row";
import { PublishFlowProvider } from "./publish-flow-provider";

const BASE_PATH = "/my-prospects";

const COLUMNS: HeadColumn[] = [
  // Sorts on the prospect's name — the email underneath it is secondary text
  // rather than a column of its own, so it is not a separate thing to order by.
  {
    key: "name",
    label: "Prospect",
    className: "min-w-44",
    skeleton: "stacked",
  },
  { key: "role", label: "Role", className: "min-w-32" },
  { key: "mode", label: "Built from", className: "min-w-36" },
  {
    key: "status",
    label: "Status",
    className: "min-w-32",
    skeleton: "stacked",
  },
  {
    key: "hubspot",
    label: "HubSpot",
    className: "min-w-28",
    skeleton: "badge",
  },
  { key: "tracking", label: "Tracking", className: "min-w-28" },
  { key: "lastViewed", label: "Last viewed", className: "min-w-28" },
  {
    key: "created",
    label: "Created",
    className: "min-w-40",
    skeleton: "stacked",
  },
  { label: "Links", className: "min-w-40", skeleton: "buttons" },
  {
    label: "Actions",
    className: "min-w-44",
    align: "right",
    skeleton: "buttons",
  },
];

/**
 * Everything one SDR owns, with every status the record holds.
 *
 * The same query as the admin directory, narrowed to `ownerEmail`. It is a
 * separate page rather than a filter because "my prospects" is the view an SDR
 * opens twenty times a day — but it is deliberately the same query and the same
 * row actions underneath, so the two cannot drift into disagreeing about a
 * prospect's state.
 *
 * Matched on the SESSION email, never on anything typed into the form: that
 * decides what they may edit.
 */
export async function MyProspects({
  email,
  page,
  sort,
}: {
  email: string;
  page: number;
  sort: Sort;
}) {
  const result = await loadProspectListing({ ownerEmail: email, page, sort });

  if (!result.ok) {
    return <DbUnreachableNotice detail={result.detail} />;
  }

  if (result.rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        You haven&apos;t generated a prospect yet. Fill in the form on the
        Create page and one will appear here.
      </p>
    );
  }

  // Read on the server, once: only the boolean crosses to the client.
  const hubspotEnabled = hasHubspotToken();

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {/* The TOTAL, not this page's length — the sentence would otherwise
            read "25 prospects" forever, however many there are. */}
        {result.total} {result.total === 1 ? "prospect" : "prospects"}
        {/* Dropped once a header is clicked — the sentence would otherwise
            describe an ordering the table is no longer in. */}
        {isDefaultSort(sort, PROSPECT_SORT_DEFAULT) ? ", newest first" : ""}.
      </p>

      {/* Wraps the table so a Publish button in a row runs the same
          publish → HubSpot → tracking sequence the editor does. */}
      <PublishFlowProvider hubspotEnabled={hubspotEnabled}>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeadRow
              columns={COLUMNS}
              sortable={PROSPECT_SORT}
              sort={sort}
              basePath={BASE_PATH}
            />
            <TableBody>
              {result.rows.map((row) => (
                <MyProspectsRow
                  key={row.id}
                  row={row}
                  hubspotEnabled={hubspotEnabled}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          page={result.page}
          total={result.total}
          perPage={result.perPage}
          basePath={BASE_PATH}
          label="prospects"
          // Without this, page 2 of a table sorted by name would quietly hand
          // back page 2 of the default ordering.
          query={sortQuery(sort, PROSPECT_SORT_DEFAULT)}
        />
      </PublishFlowProvider>
    </>
  );
}

/**
 * The page while the rows are still being queried: the count line's space,
 * then the real header over grey rows. `sort` is the page's, so the arrows
 * are already right and clicking one works before the rows have arrived.
 */
export function MyProspectsSkeleton({ sort }: { sort: Sort }) {
  return (
    <>
      <div className="mb-4 flex h-5 items-center">
        <Skeleton className="h-4 w-44" />
      </div>
      <TableSkeleton
        columns={COLUMNS}
        sort={{ sortable: PROSPECT_SORT, sort, basePath: BASE_PATH }}
        label="prospects"
        className="bg-card"
      />
    </>
  );
}
