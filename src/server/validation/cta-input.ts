import { z } from "zod";

/**
 * The CTA block — the only thing an SDR may edit in V1. Same schema in the
 * editor form and in the Server Action that saves it.
 *
 * The link accepts `https://`, `http://` and `mailto:` and nothing else. A
 * calendar page is the normal case; the mailto is the roster's fallback for an
 * SDR with no booking page, and it has to survive a round trip through the
 * editor unchanged. `javascript:` and friends are refused by the prefix check.
 */
const LINK_PREFIX = /^(https?:\/\/|mailto:)/i;

export const ctaInputSchema = z.object({
  title: z
    .string({ error: "A title is required." })
    .trim()
    .min(1, "A title is required.")
    .max(255, "That title is too long."),

  description: z
    .string({ error: "A description is required." })
    .trim()
    .max(1000, "Keep the description under 1,000 characters."),

  buttonText: z
    .string({ error: "The button needs a label." })
    .trim()
    .min(1, "The button needs a label.")
    .max(100, "That label is too long for a button."),

  url: z
    .string({ error: "A calendar link is required." })
    .trim()
    .min(1, "A calendar link is required.")
    .max(500, "That link is too long.")
    .refine(
      (value) => LINK_PREFIX.test(value) && URL.canParse(value),
      "Use a full link starting with https:// (or a mailto: address).",
    ),
});

export type CtaInput = z.infer<typeof ctaInputSchema>;

export type CtaInputErrors = Partial<Record<keyof CtaInput, string>>;

const FIELDS = ["title", "description", "buttonText", "url"] as const;

function isField(value: unknown): value is keyof CtaInput {
  return FIELDS.includes(value as (typeof FIELDS)[number]);
}

export function getCtaFieldErrors(error: z.ZodError<CtaInput>): CtaInputErrors {
  const errors: CtaInputErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (isField(field) && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
