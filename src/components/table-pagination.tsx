import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DEFAULT_PER_PAGE, pageCount, pageWindow } from "@/utils/pagination";

/**
 * The pager under every listing table.
 *
 * A Server Component built from links, with no client JavaScript at all:
 * changing page is a navigation, so the row query runs on the server and only
 * one screenful ever reaches the browser.
 */
export function TablePagination({
  page,
  total,
  perPage = DEFAULT_PER_PAGE,
  basePath,
  param = "page",
  label = "rows",
  query,
}: {
  /** The page being shown — already clamped by the query. */
  page: number;
  total: number;
  perPage?: number;
  /** Path without a query string, e.g. "/my-prospects". */
  basePath: string;
  param?: string;
  /** Plural noun for the count line: "163 prospects". */
  label?: string;
  /**
   * Other params to carry into every page link — the sort, above all. Without
   * it, paging away from page 1 would silently reset the ordering.
   */
  query?: Record<string, string>;
}) {
  const pages = pageCount(total, perPage);
  const { from, to } = pageWindow(page, total, perPage);

  // Deliberately silent for a single page. A pager that renders "Page 1 of 1"
  // under every table is furniture, not information.
  if (pages <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams(query);
    // Page 1 is the bare path, so the canonical URL has no redundant ?page=1.
    if (target > 1) params.set(param, String(target));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  return (
    <div className="mt-4 flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-muted-foreground tabular-nums">
        Showing {from}–{to} of {total} {label}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            {/* No href on the first page: the button stays in place, greyed and
                inert, so the control keeps its width instead of shifting. */}
            <PaginationPrevious href={page > 1 ? href(page - 1) : undefined} />
          </PaginationItem>

          {windowFor(page, pages).map((entry, index) =>
            entry === "gap" ? (
              // Index is a safe key here: the sequence is derived purely from
              // page and pages, so a given render always produces the same shape.
              <PaginationItem key={`gap-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={entry}>
                <PaginationLink
                  href={href(entry)}
                  isActive={entry === page}
                  aria-label={`Go to page ${entry}`}
                >
                  {entry}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext href={page < pages ? href(page + 1) : undefined} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

/**
 * Which page numbers to show: always the first and last, the current one and
 * its neighbours, and a gap for whatever is skipped.
 *
 * Listing every page breaks the layout somewhere around thirty of them, and the
 * numbers in the middle are the ones nobody clicks — the useful moves are one
 * step either way, or jumping to an end.
 */
function windowFor(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }

  const shown = new Set([1, pages, page, page - 1, page + 1]);
  // Keep the run next to whichever end we are near, so the control doesn't
  // collapse to "1 … 2 3 4" with a gap standing in for nothing.
  if (page <= 3) [2, 3, 4].forEach((n) => shown.add(n));
  if (page >= pages - 2)
    [pages - 3, pages - 2, pages - 1].forEach((n) => shown.add(n));

  const sorted = [...shown]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const current of sorted) {
    if (previous && current - previous > 1) out.push("gap");
    out.push(current);
    previous = current;
  }
  return out;
}
