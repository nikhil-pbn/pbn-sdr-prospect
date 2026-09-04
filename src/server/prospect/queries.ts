import "server-only";
import { cache } from "react";
import { Prisma, prisma, ProspectStatus, SelectionMode } from "@/server/db";
import { catalogEntry, type CatalogEntry } from "@/content/catalog";
import { STORED_TO_FORM_MODE } from "@/lib/prospect-options";
import type {
  ProspectPageContent,
  ProspectPageSection,
} from "@/types/prospect-page";

/**
 * The one select every reader uses: the prospect, and the catalog slugs it
 * ticked. No joins — the sections those slugs name are code, not rows.
 */
const PAGE_SELECT = {
  id: true,
  slug: true,
  name: true,
  email: true,
  prospectRole: true,
  mode: true,
  selections: true,
  status: true,
  version: true,
  ownerEmail: true,
  ownerName: true,
  ctaTitle: true,
  ctaDescription: true,
  ctaButtonText: true,
  ctaUrl: true,
  publishedAt: true,
  hubspotContactId: true,
} as const;

/** A prospect row shaped by PAGE_SELECT — what both readers below hand to assemblePage. */
type Row = Prisma.ProspectGetPayload<{ select: typeof PAGE_SELECT }>;

/** Which stored slug could not be rendered, and why. */
export type SchemaProblem = { path: string; detail: string };

/**
 * Turns a row into what the page renders. Each stored slug is looked up in the
 * catalog, and the sections come out in the catalog's `sortOrder` — the
 * selectable's, the only order there is.
 *
 * A slug the catalog no longer knows is reported rather than skipped. A page
 * quietly missing one of its sections is exactly the kind of wrong nobody
 * notices; a clear message — and, for the public page, a 404 with the reason
 * logged — is not. The catalog's rule (retire an entry, never remove it) is
 * what keeps this branch from running.
 *
 * The content itself is not re-validated here: the catalog checks every entry
 * against the schema once, when it loads.
 */
export function assemblePage(
  row: Row,
):
  | { ok: true; content: ProspectPageContent }
  | { ok: false; problem: SchemaProblem } {
  const mode = STORED_TO_FORM_MODE[row.mode];

  const entries: CatalogEntry[] = [];
  for (const slug of row.selections) {
    const entry = catalogEntry(mode, slug);
    if (!entry) {
      return {
        ok: false,
        problem: { path: slug, detail: "is not in the catalog" },
      };
    }
    entries.push(entry);
  }
  entries.sort((a, b) => a.sortOrder - b.sortOrder);

  const sections: ProspectPageSection[] = entries.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    content: entry.content,
  }));

  return {
    ok: true,
    content: {
      prospectName: row.name,
      sections,
      cta: {
        title: row.ctaTitle,
        description: row.ctaDescription,
        buttonText: row.ctaButtonText,
        url: row.ctaUrl,
      },
    },
  };
}

/**
 * The public page's data. Only a Published prospect resolves — a Draft returns
 * null so an SDR can't accidentally share a half-finished page by pasting the
 * link early. Wrapped in `cache()` because `generateMetadata` and the page both
 * need it: one query per request rather than two.
 *
 * Note what is NOT returned: the owner's email, the prospect's email, the
 * status. The visitor gets the page and nothing about how it was made.
 */
export const loadPublishedProspect = cache(
  async (slug: string): Promise<ProspectPageContent | null> => {
    const row = await prisma.prospect.findUnique({
      where: { slug },
      select: PAGE_SELECT,
    });
    if (!row || row.status !== ProspectStatus.Published) return null;

    const page = assemblePage(row);
    if (!page.ok) {
      console.error(
        `[prospect] ${slug}: ${page.problem.path} ${page.problem.detail}`,
      );
      return null;
    }
    return page.content;
  },
);

export type EditorProspect = {
  id: string;
  slug: string;
  status: ProspectStatus;
  version: number;
  name: string;
  email: string;
  prospectRole: string | null;
  mode: SelectionMode;
  /** Who may edit it — compared against the session, never displayed as an author. */
  ownerEmail: string;
  ownerName: string;
  publishedAt: Date | null;
  /** The linked CRM contact, or null — which makes the HubSpot dialog ask for one. */
  hubspotContactId: string | null;
};

export type EditorLoadResult =
  | { state: "ok"; prospect: EditorProspect; content: ProspectPageContent }
  | { state: "not-found" }
  | { state: "db-error"; detail: string }
  | { state: "schema-error"; problem: SchemaProblem };

/**
 * The editor's data, as a result rather than a throw, so the page can render a
 * specific message per failure instead of a stack trace.
 */
export async function loadProspectForEditor(
  id: string,
): Promise<EditorLoadResult> {
  let row: Row | null;
  try {
    row = await prisma.prospect.findUnique({
      where: { id },
      select: PAGE_SELECT,
    });
  } catch (error) {
    return {
      state: "db-error",
      detail: error instanceof Error ? error.message : String(error),
    };
  }

  if (!row) return { state: "not-found" };

  const page = assemblePage(row);
  if (!page.ok) return { state: "schema-error", problem: page.problem };

  return {
    state: "ok",
    prospect: {
      id: row.id,
      slug: row.slug,
      status: row.status,
      version: row.version,
      name: row.name,
      email: row.email,
      prospectRole: row.prospectRole,
      mode: row.mode,
      ownerEmail: row.ownerEmail,
      ownerName: row.ownerName,
      publishedAt: row.publishedAt,
      hubspotContactId: row.hubspotContactId,
    },
    content: page.content,
  };
}
