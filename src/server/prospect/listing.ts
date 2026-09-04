import "server-only";
import {
  prisma,
  type HubspotSyncStatus,
  type ProspectStatus,
  type SelectionMode,
} from "@/server/db";
import {
  clampPage,
  DEFAULT_PER_PAGE,
  skipFor,
  type Paged,
} from "@/utils/pagination";
import { PROSPECT_SORT_DEFAULT } from "@/utils/prospect-sort";
import type { Sort } from "@/utils/table-sort";
import { prospectOrderBy } from "./order-by";

export type ProspectListing = {
  id: string;
  slug: string;
  /** The prospect — usually the dentist's name. */
  name: string;
  email: string;
  /** The prospect's role at the practice, when the SDR gave one. */
  prospectRole: string | null;
  mode: SelectionMode;
  status: ProspectStatus;
  /** Whoever generated it, from the session at creation. */
  ownerEmail: string;
  /** Their name at the time, also from the session — display only. */
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
  /** When it first went live. Null for a prospect that has never been published. */
  publishedAt: Date | null;
  /** Bumped on every save, so it doubles as an edit count. */
  version: number;
  /** When a human confirmed the tracking entry. Null means nobody has. */
  trackingConfirmedAt: Date | null;
  /** Null when no HubSpot contact was linked. */
  hubspotContactId: string | null;
  /** NotAdded / Added / Failed — see HubspotSyncStatus. */
  hubspotStatus: HubspotSyncStatus;
  hubspotSyncedAt: Date | null;
  /** Why the last attempt failed. The only place this is ever read. */
  hubspotError: string | null;
  /** When a visitor last opened the public page. Null means nobody has. */
  lastViewedAt: Date | null;
};

export type ProspectListingResult =
  ({ ok: true } & Paged<ProspectListing>) | { ok: false; detail: string };

/**
 * Prospects for a listing page — every one, or just one SDR's.
 *
 * One query for both pages, so a column added for one cannot go missing from
 * the other. The unfiltered form is what All prospects shows; the page gates it
 * to admins before calling this, but the data itself holds nothing an SDR could
 * not already see on a published page.
 *
 * The selections and section content are deliberately not selected: neither
 * page shows them, and joining them for a list of links would be the largest
 * query in the app for no reason.
 *
 * Paginated at the database, not in the component: `take`/`skip` mean one
 * screenful crosses the wire however large the table grows.
 */
export async function loadProspectListing(options?: {
  /** Case-insensitive: Google's casing is not guaranteed to match what was stored. */
  ownerEmail?: string;
  page?: number;
  perPage?: number;
  /** Already validated against PROSPECT_SORT; defaults to newest first. */
  sort?: Sort;
}): Promise<ProspectListingResult> {
  const owner = options?.ownerEmail?.trim().toLowerCase();
  const perPage = options?.perPage ?? DEFAULT_PER_PAGE;
  const where = owner
    ? { ownerEmail: { equals: owner, mode: "insensitive" as const } }
    : {};

  try {
    // Counted first so the requested page can be clamped before it is fetched —
    // `?page=99` then shows the last page rather than an empty table.
    const total = await prisma.prospect.count({ where });
    const page = clampPage(options?.page ?? 1, total, perPage);

    const rows = await prisma.prospect.findMany({
      where,
      orderBy: prospectOrderBy(options?.sort ?? PROSPECT_SORT_DEFAULT),
      skip: skipFor(page, perPage),
      take: perPage,
      select: {
        id: true,
        slug: true,
        name: true,
        email: true,
        prospectRole: true,
        mode: true,
        status: true,
        ownerEmail: true,
        ownerName: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        version: true,
        trackingConfirmedAt: true,
        hubspotContactId: true,
        hubspotStatus: true,
        hubspotSyncedAt: true,
        hubspotError: true,
        lastViewedAt: true,
      },
    });
    return { ok: true, rows, total, page, perPage };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
