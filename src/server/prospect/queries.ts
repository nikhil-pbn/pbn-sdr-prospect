import "server-only";
import { cache } from "react";
import { Prisma, prisma, ProspectStatus, SelectionMode } from "@/server/db";
import { sectionContentSchema } from "@/types/section-content";
import type {
  ProspectPageContent,
  ProspectPageSection,
} from "@/types/prospect-page";

/**
 * The one select every reader uses: the prospect, and whichever join table its
 * mode fills, each through to the Section that renders it.
 */
const PAGE_SELECT = {
  id: true,
  slug: true,
  name: true,
  email: true,
  prospectRole: true,
  mode: true,
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
  categories: {
    select: {
      category: {
        select: { slug: true, name: true, sortOrder: true, section: true },
      },
    },
  },
  painPoints: {
    select: {
      painPoint: {
        select: { slug: true, name: true, sortOrder: true, section: true },
      },
    },
  },
} as const;

/** A prospect row shaped by PAGE_SELECT — what both readers below hand to assemblePage. */
type Row = Prisma.ProspectGetPayload<{ select: typeof PAGE_SELECT }>;

export type SchemaProblem = { path: string; detail: string };

/**
 * Turns a row into what the page renders. Sections come out in `sortOrder` —
 * the selectable's, the only order there is — and each one's JSON is PARSED, not
 * cast, so a row written by an older shape is reported rather than crashing the
 * page. Returns the first problem instead of content when one is found.
 */
export function assemblePage(
  row: Row,
):
  | { ok: true; content: ProspectPageContent }
  | { ok: false; problem: SchemaProblem } {
  const selectables =
    row.mode === SelectionMode.Category
      ? row.categories.map((join) => join.category)
      : row.painPoints.map((join) => join.painPoint);

  const sections: ProspectPageSection[] = [];
  for (const item of [...selectables].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  )) {
    const parsed = sectionContentSchema.safeParse(item.section.content);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        ok: false,
        problem: {
          path: `${item.slug}.${issue?.path.join(".") ?? ""}`,
          detail: issue?.message ?? "did not match the schema",
        },
      };
    }
    sections.push({
      id: item.section.id,
      slug: item.slug,
      name: item.name,
      content: parsed.data,
    });
  }

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
