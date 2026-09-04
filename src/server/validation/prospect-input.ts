import { z } from "zod";
import { SELECTION_MODES } from "@/lib/prospect-options";
import { isHubspotContactUrl } from "@/utils/hubspot-contact-url";

/**
 * Validates the homepage form. One schema, used twice: the form runs it in the
 * browser for instant messages, and the Server Action runs it again because a
 * POST to the action never had to pass through the form.
 *
 * `name`, `email` and `prospectRole` are the PROSPECT's — the person the SDR
 * spoke with, and their role there. The SDR's own identity is never a form field;
 * it comes from the session.
 *
 * Whether each selected slug EXISTS is not checked here: the options live in the
 * database, so that check belongs to `createProspect`, which reports an unknown
 * slug as a field error on `selections` exactly as a schema failure would be.
 */
export const prospectInputSchema = z
  .object({
    // The `error` on `z.string()` covers a MISSING field (a hand-built request
    // that omits it), the `min(1)` covers an empty one. Same words for both, so
    // the two failure modes read identically.
    name: z
      .string({ error: "The prospect's name is required." })
      .trim()
      .min(1, "The prospect's name is required.")
      .max(255, "That name is too long."),

    email: z
      .string({ error: "The prospect's email is required." })
      .trim()
      .min(1, "The prospect's email is required.")
      .max(255, "That email is too long.")
      // Piped so the format is checked on the TRIMMED value; a pasted address
      // with a trailing space is not a typo worth refusing.
      .pipe(z.email({ error: "That doesn't look like an email address." })),

    /**
     * The prospect's role at the practice — "Office manager", "Dentist / owner".
     * OPTIONAL: blank is normal. Shown on the lists and in the analytics.
     */
    prospectRole: z
      .string({ error: "Enter the prospect's role, or leave it blank." })
      .trim()
      .max(255, "That role is too long."),

    /**
     * The CRM record this prospect belongs to, pasted from the address bar.
     * OPTIONAL: blank means the HubSpot dialog after publishing asks for it
     * instead. Validated rather than accepted blindly, because the mistake it
     * catches is invisible later: a wrong URL still publishes fine and only
     * shows up as a link missing from the CRM days afterwards.
     */
    hubspotContactUrl: z
      .string({ error: "Paste the HubSpot contact URL, or leave it blank." })
      .trim()
      .max(500, "That URL is too long.")
      .refine(
        (value) => value === "" || isHubspotContactUrl(value),
        "That doesn't look like a HubSpot contact URL. It should look like https://app.hubspot.com/contacts/21924079/record/0-1/123456789",
      ),

    mode: z.enum(SELECTION_MODES, {
      error: "Choose Category / Solution or Pain Points.",
    }),

    selections: z
      .array(z.string().trim().min(1).max(100), {
        error: "Select at least one item.",
      })
      .min(1, "Select at least one item.")
      .max(50, "That is too many selections."),
  })
  .superRefine((value, ctx) => {
    if (!Array.isArray(value.selections)) return;
    if (new Set(value.selections).size !== value.selections.length) {
      ctx.addIssue({
        code: "custom",
        path: ["selections"],
        message: "An item was selected twice.",
      });
    }
  });

export type ProspectInput = z.infer<typeof prospectInputSchema>;

/** Field-keyed errors, shaped for rendering next to the inputs. */
export type ProspectInputErrors = Partial<Record<keyof ProspectInput, string>>;

/** Listed once, so adding a field to the schema can't leave its error unreported. */
const FIELDS = [
  "name",
  "email",
  "prospectRole",
  "hubspotContactUrl",
  "mode",
  "selections",
] as const;

function isField(value: unknown): value is keyof ProspectInput {
  return FIELDS.includes(value as (typeof FIELDS)[number]);
}

export function getFieldErrors(
  error: z.ZodError<ProspectInput>,
): ProspectInputErrors {
  const errors: ProspectInputErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (isField(field) && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
