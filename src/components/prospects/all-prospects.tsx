import { DbUnreachableNotice } from "@/components/notices/db-unreachable-notice";
import { TablePagination } from "@/components/table-pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { hasHubspotToken } from "@/server/hubspot/client";
import { loadProspectListing } from "@/server/prospect/listing";
import { PROSPECT_SORT, PROSPECT_SORT_DEFAULT } from "@/utils/prospect-sort";
import { isDefaultSort, sortQuery, type Sort } from "@/utils/table-sort";
import {
  AllProspectsTable,
  ALL_PROSPECTS_COLUMNS,
} from "./all-prospects-table";
import { PublishFlowProvider } from "./publish-flow-provider";

/**
 * The whole-team directory: every prospect, who made it, when, and the link.
 *
 * Admin only, per the brief. The page gates on `isAdmin` before rendering this;
 * the data itself is the same listing query My prospects uses, unfiltered.
 */
export async function AllProspects({
  page,
  sort,
}: {
  page: number;
  sort: Sort;
}) {
  const result = await loadProspectListing({ page, sort });

  if (!result.ok) {
    return <DbUnreachableNotice detail={result.detail} />;
  }

  const hubspotEnabled = hasHubspotToken();

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {result.total} {result.total === 1 ? "prospect" : "prospects"}
        {isDefaultSort(sort, PROSPECT_SORT_DEFAULT) ? ", newest first" : ""}.
        Anyone can open a published link; only its owner or an admin can edit
        it. As an admin you can publish or unpublish any of them.
      </p>
      {/* Wraps the table so a Publish button in a row runs the same
          publish → HubSpot → tracking sequence the editor does. */}
      <PublishFlowProvider hubspotEnabled={hubspotEnabled}>
        <AllProspectsTable
          rows={result.rows}
          sort={sort}
          hubspotEnabled={hubspotEnabled}
        />
        <TablePagination
          page={result.page}
          total={result.total}
          perPage={result.perPage}
          basePath="/all-prospects"
          label="prospects"
          query={sortQuery(sort, PROSPECT_SORT_DEFAULT)}
        />
      </PublishFlowProvider>
    </>
  );
}

/**
 * The page while the rows are still being queried: the blurb's space, then the
 * real header over grey rows. `sort` is the page's, so the arrows are already
 * right and clicking one works before the rows have arrived.
 */
export function AllProspectsSkeleton({ sort }: { sort: Sort }) {
  return (
    <>
      <div className="mb-4 flex h-5 items-center">
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <TableSkeleton
        columns={ALL_PROSPECTS_COLUMNS}
        sort={{ sortable: PROSPECT_SORT, sort, basePath: "/all-prospects" }}
        label="prospects"
        className="bg-card"
      />
    </>
  );
}
