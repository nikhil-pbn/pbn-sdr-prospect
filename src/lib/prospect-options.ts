/**
 * The two selection modes and the shape of a selectable option.
 *
 * The options themselves — the categories and pain points — are code, in
 * `content/catalog`, and reach the form as props from the page. Nothing here is
 * a list of business names; that folder is the one place those are written.
 *
 * `sortOrder` is explicit on every option and is the ONLY thing the rendered
 * order may come from — never insertion order, never the order the SDR ticked
 * the boxes. `resolveSelections` enforces that on both sides of the wire.
 */

export const SELECTION_MODES = ["category", "pain_point"] as const;
export type SelectionMode = (typeof SELECTION_MODES)[number];

export type SelectionOption = {
  /** Stable key the form submits — the row's `slug`. */
  slug: string;
  name: string;
  /** Explicit position in the rendered prospect. */
  sortOrder: number;
};

/** Both lists, as the page hands them to the form. */
export type SelectionOptions = Record<SelectionMode, SelectionOption[]>;

export const MODE_DETAILS: Record<
  SelectionMode,
  { label: string; description: string; listHeading: string }
> = {
  category: {
    label: "Category / Solution",
    description: "The prospect asked about a specific PbN solution.",
    listHeading: "Which solutions did they ask about?",
  },
  pain_point: {
    label: "Pain Points",
    description: "The prospect described problems they are having today.",
    listHeading: "Which problems did they raise?",
  },
};

export function isSelectionMode(value: unknown): value is SelectionMode {
  return SELECTION_MODES.includes(value as SelectionMode);
}

/** A list in display order, whatever order it arrived in. */
export function sortOptions<T extends { sortOrder: number }>(
  options: readonly T[],
): T[] {
  return [...options].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * The selected slugs as options, in `sortOrder`, with anything unknown dropped.
 * The same function serves the form (to store selections tidily) and the server
 * (to decide what a prospect is made of), so the two can never disagree.
 */
export function resolveSelections<T extends SelectionOption>(
  options: readonly T[],
  slugs: readonly string[],
): T[] {
  const wanted = new Set(slugs);
  return sortOptions(options).filter((option) => wanted.has(option.slug));
}

/**
 * Labels for the mode as it is STORED — the Prisma `SelectionMode` enum, whose
 * values differ from the form's. For the listing tables, which read rows
 * straight from the database and never see a form value.
 */
export const STORED_MODE_LABELS: Record<"Category" | "PainPoint", string> = {
  Category: MODE_DETAILS.category.label,
  PainPoint: MODE_DETAILS.pain_point.label,
};

/**
 * The stored mode as the form's key — which half of the catalog a prospect's
 * `selections` are slugs from. The renderer needs this to look them up.
 */
export const STORED_TO_FORM_MODE: Record<
  "Category" | "PainPoint",
  SelectionMode
> = {
  Category: "category",
  PainPoint: "pain_point",
};
