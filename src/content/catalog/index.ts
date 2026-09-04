import { sectionContentSchema } from "@/types/section-content";
import type {
  SelectionMode,
  SelectionOption,
  SelectionOptions,
} from "@/lib/prospect-options";
import { CATEGORIES } from "./categories";
import { PAIN_POINTS } from "./pain-points";
import type { CatalogEntry } from "./shared";

export type { CatalogEntry } from "./shared";

/**
 * The predefined catalog — every category and pain point, each with the
 * section that answers it — as code.
 *
 * It used to be three tables (`categories`, `pain_points`, `sections`) filled
 * by a seed script from these same files. The app never edited that copy, so it
 * could only ever equal the files or lag behind them. Now there is one copy,
 * and a content change ships with the deploy that contains it, with no seed
 * step to forget.
 *
 * Prospects record what was ticked as slugs from this list — which is what
 * makes the one rule here matter: a slug that a prospect may have used is
 * NEVER removed or renamed. Set `retired: true` instead. It disappears from
 * the form while every page that already chose it keeps rendering.
 */

/**
 * Checked once, when the module first loads: slugs unique, every section's
 * content matching the schema the page renders from. The seed used to run
 * these checks as it wrote each row. Without a seed, the first request would
 * otherwise be the first to find out, one prospect at a time.
 */
function checked(
  mode: SelectionMode,
  entries: readonly CatalogEntry[],
): CatalogEntry[] {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.slug)) {
      throw new Error(`catalog: duplicate ${mode} slug "${entry.slug}"`);
    }
    seen.add(entry.slug);

    const parsed = sectionContentSchema.safeParse(entry.content);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(
        `catalog: ${mode} "${entry.slug}" ${issue?.path.join(".") ?? ""}: ${issue?.message ?? "did not match the schema"}`,
      );
    }
  }

  // In sortOrder, so nothing downstream sorts again — each entry keeps its own
  // sortOrder too, since that, not array position, is what the page orders by.
  return [...entries].sort((a, b) => a.sortOrder - b.sortOrder);
}

export const CATALOG: Record<SelectionMode, readonly CatalogEntry[]> = {
  category: checked("category", CATEGORIES),
  pain_point: checked("pain_point", PAIN_POINTS),
};

/** Still offered on the form. */
function offered(entry: CatalogEntry): boolean {
  return !entry.retired;
}

function toOption({ slug, name, sortOrder }: CatalogEntry): SelectionOption {
  return { slug, name, sortOrder };
}

/** Both lists as the form needs them — offered entries only, in order. */
export function catalogOptions(): SelectionOptions {
  return {
    category: CATALOG.category.filter(offered).map(toOption),
    pain_point: CATALOG.pain_point.filter(offered).map(toOption),
  };
}

/**
 * The entries behind a set of slugs, in catalog order, for a NEW prospect.
 * Only offered entries count, so a retired one cannot be picked by replaying an
 * old form submission. Unknown slugs are simply absent; the caller compares.
 */
export function selectableEntries(
  mode: SelectionMode,
  slugs: readonly string[],
): CatalogEntry[] {
  const wanted = new Set(slugs);
  return CATALOG[mode].filter(
    (entry) => offered(entry) && wanted.has(entry.slug),
  );
}

/**
 * One entry by slug, retired or not, for RENDERING a prospect that already
 * chose it. Null only for a slug that was never in the catalog — or was
 * removed against the rule above.
 */
export function catalogEntry(
  mode: SelectionMode,
  slug: string,
): CatalogEntry | null {
  return CATALOG[mode].find((entry) => entry.slug === slug) ?? null;
}
