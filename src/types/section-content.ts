import { z } from "zod";

/**
 * The shape of every predefined section's `content` column: a header, then an
 * ordered list of BLOCKS. The template's cards differ in which blocks they
 * carry, in what order, and under which headings — so the layout is data too,
 * and one renderer draws every card.
 *
 * Block kinds, as the template uses them:
 *
 *   text     a heading and a paragraph            ("Best fit", the All-in-One intro)
 *   inline   items on one line, "|" or "•" between  ("Does this sound familiar?");
 *            an optional bold LEAD opens the line   ("Connected solution")
 *   tiles    up to four pastel tiles, label + line  (See / Understand / Act)
 *   grid     the bordered two-column capability grid ("Core capabilities")
 *   bullets  a bulleted line, or STACKED one per line ("What changes" / "When this problem shows up")
 *
 * A heading may be empty — the standard card's tiles have none. Structured
 * fields, never HTML. Parsed on every read (`safeParse`, never a cast) so a row
 * written by an older shape is reported rather than crashing the page.
 */

const heading = z.string().max(120);
const line = z.string().min(1).max(240);

export const sectionBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    heading,
    text: z.string().min(1).max(1000),
  }),
  z.object({
    type: z.literal("inline"),
    heading,
    separator: z.enum(["|", "•"]),
    /** Bold opener before the first separator — the pain-point cards' "Connected solution" line. */
    lead: line.optional(),
    items: z.array(line).min(1).max(8),
  }),
  z.object({
    type: z.literal("tiles"),
    heading,
    items: z
      .array(z.object({ label: z.string().min(1).max(40), text: line }))
      .min(1)
      .max(4),
  }),
  z.object({
    type: z.literal("grid"),
    heading,
    items: z
      .array(
        z.object({
          name: z.string().min(1).max(120),
          description: z.string().max(240),
        }),
      )
      .min(1)
      .max(10),
  }),
  z.object({
    type: z.literal("bullets"),
    heading,
    /** One item per line, for full sentences; omitted, short items flow on one line. */
    stacked: z.boolean().optional(),
    items: z.array(line).min(1).max(8),
  }),
]);

export type SectionBlock = z.infer<typeof sectionBlockSchema>;

export const sectionContentSchema = z.object({
  /** Small uppercase label in the header — "Business Analytics Solution". */
  eyebrow: z.string().max(80),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500),
  /** The body, top to bottom. Empty renders just the header. */
  blocks: z.array(sectionBlockSchema).max(10),
});

export type SectionContent = z.infer<typeof sectionContentSchema>;

/**
 * Marks copy the business has not supplied yet. Kept as a visible prefix on
 * purpose: placeholder text that looks final gets shipped. The seed report and
 * the editor both search for this exact string.
 */
export const COPY_PENDING = "[Copy pending]";

function blockTexts(block: SectionBlock): string[] {
  switch (block.type) {
    case "text":
      return [block.heading, block.text];
    case "inline":
      return [block.heading, block.lead ?? "", ...block.items];
    case "bullets":
      return [block.heading, ...block.items];
    case "tiles":
      return [block.heading, ...block.items.map((item) => item.text)];
    case "grid":
      return [block.heading, ...block.items.map((item) => item.description)];
  }
}

export function isCopyPending(content: SectionContent): boolean {
  return [content.subtitle, ...content.blocks.flatMap(blockTexts)].some(
    (text) => text.includes(COPY_PENDING),
  );
}
