import "server-only";
import { prisma, ProspectStatus, SelectionMode } from "@/server/db";
import { recordGeneration } from "@/server/tracking/record";
import { defaultCta } from "@/content/cta";
import { hubspotContactIdFrom } from "@/utils/hubspot-contact-url";
import { prospectUrlFor } from "@/utils/prospect-url";
import { sdrCalendarHref } from "@/utils/sdr-roster";
import type { SelectionMode as FormMode } from "@/lib/prospect-options";
import { findSelectables } from "./catalog";
import { buildUniqueSlug } from "./slug";

/** One or more selected slugs matched no active row. Reported on the form. */
export class UnknownSelectionError extends Error {
  constructor(public readonly slugs: string[]) {
    super(`Unknown or inactive selections: ${slugs.join(", ")}`);
    this.name = "UnknownSelectionError";
  }
}

/** The form's lowercase mode → the database enum. */
const MODE_TO_DB: Record<FormMode, SelectionMode> = {
  category: SelectionMode.Category,
  pain_point: SelectionMode.PainPoint,
};

/**
 * "Generate", as a database operation and nothing else:
 *
 *   resolve the selected rows → mint a slug → seed the CTA → create the prospect
 *   with its selection rows in one transaction → write the tracking log row.
 *
 * No content is copied. The prospect references the Category / PainPoint rows,
 * and each of those references its Section; the page reads the content from
 * there at render time, so a fix to a section reaches every prospect at once.
 *
 * Throws on failure — the calling action classifies the error, because only it
 * knows how to phrase the message for the SDR.
 */
export async function createProspect(input: {
  name: string;
  email: string;
  /** Optional. The prospect's role at the practice; blank becomes null. */
  prospectRole?: string;
  mode: FormMode;
  selections: string[];
  /** Optional. The CRM contact's URL, pasted from the address bar. */
  hubspotContactUrl?: string;
  /**
   * The signed-in SDR, from the session. Becomes the only non-admin who can edit
   * this prospect, and whose calendar the page books into — so it must never be
   * taken from the form.
   */
  owner: { email: string; name: string };
}): Promise<{ id: string; slug: string }> {
  const rows = await findSelectables(input.mode, input.selections);

  const found = new Set(rows.map((row) => row.slug));
  const missing = input.selections.filter((slug) => !found.has(slug));
  if (missing.length > 0) throw new UnknownSelectionError(missing);

  const slug = await buildUniqueSlug(
    input.name,
    async (candidate) =>
      (await prisma.prospect.count({ where: { slug: candidate } })) > 0,
  );

  const cta = defaultCta(sdrCalendarHref(input.owner.email));

  const ids = rows.map((row) => row.id);

  // Only the id is kept, not the URL it came from. The id is what the CRM API
  // takes; the rest of that URL is a portal id identical on every row plus a
  // routing shape HubSpot has already changed once. Parsed again here rather
  // than trusted from the form, because this module is also reachable from
  // scripts.
  const hubspotContactId = input.hubspotContactUrl
    ? hubspotContactIdFrom(input.hubspotContactUrl)
    : null;

  const prospect = await prisma.prospect.create({
    data: {
      slug,
      ownerEmail: input.owner.email.trim().toLowerCase(),
      ownerName: input.owner.name,
      name: input.name,
      email: input.email,
      prospectRole: input.prospectRole?.trim() || null,
      mode: MODE_TO_DB[input.mode],
      status: ProspectStatus.Draft,
      hubspotContactId,
      ctaTitle: cta.title,
      ctaDescription: cta.description,
      ctaButtonText: cta.buttonText,
      ctaUrl: cta.url,
      // Only the join table for the chosen mode is written; the other stays empty.
      ...(input.mode === "category"
        ? { categories: { create: ids.map((categoryId) => ({ categoryId })) } }
        : {
            painPoints: {
              create: ids.map((painPointId) => ({ painPointId })),
            },
          }),
    },
    select: { id: true, slug: true, name: true, email: true },
  });

  // One tracking row per successful generation, written after the prospect
  // exists so the log can never reference something that was never saved. Its
  // own try/catch: the prospect IS created by now, and the publish step confirms
  // (upserts) this row anyway, so a hiccup here must not fail the generation.
  try {
    await recordGeneration({
      sdrName: input.owner.name,
      prospectName: prospect.name,
      prospectEmail: prospect.email,
      prospectUrl: prospectUrlFor(prospect.slug),
    });
  } catch (error) {
    console.error("recordGeneration failed", error);
  }

  return { id: prospect.id, slug: prospect.slug };
}
