import "server-only";
import { z } from "zod";
import { prisma, ProspectStatus } from "@/server/db";
import { confirmTracking } from "@/server/tracking/record";
import type { CtaInput } from "@/server/validation/cta-input";
import { revalidateProspect } from "./revalidate";
import type { MutationResult } from "./results";

/**
 * Every write to an existing prospect. Kept out of `actions.ts` so that file
 * stays a thin "use server" surface that only checks who is asking.
 */

/** Persists the CTA — the only editable block. `version` moves so a stale tab can be told later. */
export async function saveCta(
  id: string,
  cta: CtaInput,
): Promise<MutationResult> {
  try {
    const existing = await prisma.prospect.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) {
      return { ok: false, message: "That prospect no longer exists." };
    }

    await prisma.prospect.update({
      where: { id },
      data: {
        ctaTitle: cta.title,
        ctaDescription: cta.description,
        ctaButtonText: cta.buttonText,
        ctaUrl: cta.url,
        version: { increment: 1 },
      },
    });

    revalidateProspect(id, existing.slug);
    return { ok: true };
  } catch (error) {
    console.error("saveCta failed", error);
    return { ok: false, message: "Could not save. Please try again." };
  }
}

/**
 * Flips a prospect between Draft and Published. The public page only renders
 * once status is Published, so unpublishing takes the link offline.
 *
 * `publishedAt` is set on publish and left alone on unpublish — it records when
 * the prospect first went live, not its current state.
 */
export async function setPublished(
  id: string,
  publish: boolean,
): Promise<MutationResult> {
  try {
    const prospect = await prisma.prospect.update({
      where: { id },
      data: publish
        ? { status: ProspectStatus.Published, publishedAt: new Date() }
        : { status: ProspectStatus.Draft },
      select: { slug: true },
    });

    revalidateProspect(id, prospect.slug);
    return { ok: true };
  } catch (error) {
    console.error(publish ? "publish failed" : "unpublish failed", error);
    return {
      ok: false,
      message: publish
        ? "Could not publish. Please try again."
        : "Could not unpublish. Please try again.",
    };
  }
}

/**
 * The tracking popup's Save: confirms the log row and stamps the prospect.
 *
 * The prospect's own columns are kept in step with what the SDR confirmed, so
 * the lists and the tracking log never disagree about who the prospect is.
 *
 * `trackingConfirmedAt` is stamped here and nowhere else: it is the only
 * evidence that a person passed through the dialog, since the tracking row
 * itself was written automatically at generation and looks the same either way.
 */
export async function saveTrackingDetails(
  id: string,
  fields: { sdrName: string; prospectName: string; prospectEmail: string },
): Promise<MutationResult> {
  const sdrName = String(fields.sdrName ?? "").trim();
  const prospectName = String(fields.prospectName ?? "").trim();
  const prospectEmail = String(fields.prospectEmail ?? "").trim();

  if (!sdrName) return { ok: false, message: "The SDR's name is required." };
  if (!prospectName) {
    return { ok: false, message: "The prospect's name is required." };
  }
  if (!z.email().safeParse(prospectEmail).success) {
    return { ok: false, message: "That doesn't look like an email address." };
  }
  if (
    sdrName.length > 255 ||
    prospectName.length > 255 ||
    prospectEmail.length > 255
  ) {
    return { ok: false, message: "One of those values is too long." };
  }

  try {
    const prospect = await prisma.prospect.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!prospect) {
      return { ok: false, message: "That prospect no longer exists." };
    }

    await confirmTracking({
      slug: prospect.slug,
      sdrName,
      prospectName,
      prospectEmail,
    });

    await prisma.prospect.update({
      where: { id },
      data: {
        name: prospectName,
        email: prospectEmail,
        ownerName: sdrName,
        trackingConfirmedAt: new Date(),
      },
    });

    revalidateProspect(id, prospect.slug);
    return { ok: true };
  } catch (error) {
    console.error("saveTrackingDetails failed", error);
    return { ok: false, message: "Could not save the tracking details." };
  }
}
