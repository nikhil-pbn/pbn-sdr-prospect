import {
  COPY_PENDING,
  type SectionBlock,
  type SectionContent,
} from "@/types/section-content";

/** One selectable and the section that answers it. */
export type CatalogEntry = {
  /** Stable key — what a prospect stores. Never renamed once a prospect may hold it. */
  slug: string;
  name: string;
  /** Explicit position in the rendered prospect — never array position. */
  sortOrder: number;
  content: SectionContent;
  /**
   * Hidden from the form, still rendered for prospects that already chose it.
   * The catalog's alternative to deleting: a page that was sent must keep working.
   */
  retired?: boolean;
};

/** Grid items with a real name and no line yet. */
export function names(
  ...list: string[]
): { name: string; description: string }[] {
  return list.map((name) => ({ name, description: "" }));
}

/**
 * The block headings the standard card uses. Listed once so the seed files
 * spell them identically; a card that wants a different heading writes its own.
 */
export const STANDARD_HEADINGS = {
  familiar: "Does this sound familiar?",
  capabilities: "Core capabilities",
  fit: "Built to work with your practice",
  bestFit: "Best fit",
  changes: "What changes",
} as const;

/**
 * A section whose copy has not been supplied: header from the name, the
 * subtitle carrying the visible pending marker, and whatever blocks exist.
 */
export function pending(input: {
  slug: string;
  name: string;
  sortOrder: number;
  eyebrow: string;
  title?: string;
  subtitle?: string;
  blocks?: SectionBlock[];
}): CatalogEntry {
  return {
    slug: input.slug,
    name: input.name,
    sortOrder: input.sortOrder,
    content: {
      eyebrow: input.eyebrow,
      title: input.title ?? input.name,
      subtitle:
        input.subtitle ??
        `${COPY_PENDING} One sentence on what this does for the practice.`,
      blocks: input.blocks ?? [],
    },
  };
}
