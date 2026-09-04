import "server-only";
import type { Prisma } from "@/server/db";
import type { Sort } from "@/utils/table-sort";

/**
 * Turns a validated sort into Prisma's `orderBy` for the listing query.
 *
 * A lookup table, not a computed field name. The key came out of a query
 * string, and building `{ [sort.key]: dir }` from it would let anyone order by
 * a column that does not exist and make Prisma throw. Only what is written here
 * can be sorted by.
 *
 * Every ordering ends in `id`, which is what makes pagination correct.
 * `LIMIT`/`OFFSET` over a non-unique ORDER BY has no defined tie order in
 * Postgres, so sorting by status — two distinct values across hundreds of rows
 * — genuinely can show one prospect on both page 1 and page 2 while another
 * appears on neither. A unique last key removes the ambiguity.
 */

type ProspectOrder = Prisma.ProspectOrderByWithRelationInput;

export function prospectOrderBy(sort: Sort): ProspectOrder[] {
  const dir = sort.dir;

  const columns: Record<string, ProspectOrder> = {
    name: { name: dir },
    email: { email: dir },
    role: { prospectRole: { sort: dir, nulls: "last" } },
    lastViewed: { lastViewedAt: { sort: dir, nulls: "last" } },
    // The email, not the displayed name: the name shown is resolved from the
    // roster at render time, so it is not a column and could not be ordered by.
    // Addresses are `first.last@`, so the result reads the same as sorting the
    // names for everyone on the roster.
    owner: { ownerEmail: dir },
    mode: { mode: dir },
    status: { status: dir },
    created: { createdAt: dir },
    updated: { updatedAt: dir },
    hubspot: { hubspotStatus: dir },
    // Nullable, and the null means "never" — never published, never confirmed.
    // Postgres puts nulls FIRST on a DESC sort by default, which would open the
    // column with the rows that have no value in it — so both say `last`.
    published: { publishedAt: { sort: dir, nulls: "last" } },
    tracking: { trackingConfirmedAt: { sort: dir, nulls: "last" } },
  };

  return [columns[sort.key] ?? { createdAt: dir }, { id: "asc" }];
}
