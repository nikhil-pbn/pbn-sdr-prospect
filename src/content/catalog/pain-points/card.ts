import type { CatalogEntry } from "../shared";

/**
 * The "Problem-led solution" card, as the ten pain-point templates lay it out
 * (supplied 2026-09-04). Every pain point uses exactly this shape, so the
 * builder holds the headings and the block order once and each file supplies
 * only its copy:
 *
 *   When this problem shows up      three stacked bullets
 *   What needs to change            three tiles
 *   How Practice by Numbers can help six capabilities, two columns
 *   Connected solution              bold lead • Designed for dental workflows • …
 *   Best fit                        one sentence
 *   What changes                    three short items, "|" between
 *
 * A pain point that one day needs a different layout can write its blocks
 * directly instead — the renderer draws whatever the block list says.
 */

const HEADINGS = {
  showsUp: "When this problem shows up",
  change: "What needs to change",
  help: "How Practice by Numbers can help",
  connected: "Connected solution",
  bestFit: "Best fit",
  changes: "What changes",
} as const;

/** The three reassurances every card repeats after its connected solution. */
const STANDARD_FIT = [
  "Designed for dental workflows",
  "Connects with supported practice management systems",
  "Guided onboarding and support",
];

export function problemCard(input: {
  slug: string;
  name: string;
  sortOrder: number;
  title: string;
  subtitle: string;
  showsUp: string[];
  change: { label: string; text: string }[];
  help: { name: string; description: string }[];
  /** The bold opener of the "Connected solution" line. */
  connected: string;
  bestFit: string;
  changes: string[];
}): CatalogEntry {
  return {
    slug: input.slug,
    name: input.name,
    sortOrder: input.sortOrder,
    content: {
      eyebrow: "Problem-led solution",
      title: input.title,
      subtitle: input.subtitle,
      blocks: [
        {
          type: "bullets",
          heading: HEADINGS.showsUp,
          stacked: true,
          items: input.showsUp,
        },
        { type: "tiles", heading: HEADINGS.change, items: input.change },
        { type: "grid", heading: HEADINGS.help, items: input.help },
        {
          type: "inline",
          heading: HEADINGS.connected,
          separator: "•",
          lead: input.connected,
          items: STANDARD_FIT,
        },
        { type: "text", heading: HEADINGS.bestFit, text: input.bestFit },
        {
          type: "inline",
          heading: HEADINGS.changes,
          separator: "|",
          items: input.changes,
        },
      ],
    },
  };
}

/** A capability cell: `cap("Practice IQ", "Monitor …")`. */
export function cap(name: string, description: string) {
  return { name, description };
}

/** A "What needs to change" tile: `tile("SEE", "Create …")`. */
export function tile(label: string, text: string) {
  return { label, text };
}
