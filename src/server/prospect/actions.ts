"use server";

import { redirect } from "next/navigation";
import { SIGNED_OUT_MESSAGE, getCurrentUser } from "@/server/auth/current-user";
import { canCreateProspects } from "@/server/auth/sdr-team";
import {
  getFieldErrors,
  prospectInputSchema,
  type ProspectInput,
} from "@/server/validation/prospect-input";
import {
  ctaInputSchema,
  getCtaFieldErrors,
  type CtaInput,
} from "@/server/validation/cta-input";
import { editorPathFor } from "@/utils/prospect-url";
import { createProspect, UnknownSelectionError } from "./create-prospect";
import { syncProspectToHubspot } from "./hubspot-sync";
import { saveCta, saveTrackingDetails, setPublished } from "./mutations";
import { ownsProspect } from "./ownership";
import {
  DATABASE_DOWN_MESSAGE,
  NOT_AN_SDR_MESSAGE,
  NOT_THE_OWNER_MESSAGE,
  isDatabaseUnreachable,
  type GenerateResult,
  type MutationResult,
  type SaveCtaResult,
} from "./results";

/**
 * The app's write surface. Every one of these is a public HTTP endpoint, so each
 * re-validates its input rather than trusting the caller, and each checks for a
 * session of its own — gating the pages hides the buttons; it does nothing to
 * stop a POST straight at the action. This is the real lock.
 *
 * Three gates, narrowing:
 *
 *   signed in                          may see the tool
 *   on SDR_ACCESS_EMAILS               may create a prospect
 *   owner of THIS prospect, or admin   may edit / publish this one
 *
 * There is no AI anywhere in this file, or anywhere it calls.
 */

export async function generateProspect(
  input: ProspectInput,
): Promise<GenerateResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: SIGNED_OUT_MESSAGE };
  if (!canCreateProspects(user.email)) {
    return { ok: false, message: NOT_AN_SDR_MESSAGE };
  }

  // Never trust the client, even though the form validates with the same schema.
  const parsed = prospectInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  let created: { id: string };
  try {
    created = await createProspect({
      ...parsed.data,
      // From the session, never the form: this is the access key for every later
      // edit and the calendar the page books into.
      owner: { email: user.email, name: user.name },
    });
  } catch (error) {
    if (error instanceof UnknownSelectionError) {
      return {
        ok: false,
        message: "Please fix the highlighted fields.",
        fieldErrors: {
          selections:
            "One of the selected items is no longer available. Clear the list and pick again.",
        },
      };
    }

    console.error("generateProspect failed", error);
    if (isDatabaseUnreachable(error)) {
      return { ok: false, message: DATABASE_DOWN_MESSAGE };
    }
    const raw = error instanceof Error ? error.message : String(error);
    return { ok: false, message: `Could not create the prospect: ${raw}` };
  }

  // Outside the try/catch on purpose: redirect() signals by throwing, and
  // catching it would swallow the navigation.
  redirect(editorPathFor(created.id));
}

/**
 * Shared by the mutations below. Two checks plus ownership: every signed-in SDR
 * may create, but only the owner (or an admin) may change THIS prospect.
 */
async function blocked(id: string): Promise<MutationResult | null> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: SIGNED_OUT_MESSAGE };
  if (!canCreateProspects(user.email)) {
    return { ok: false, message: NOT_AN_SDR_MESSAGE };
  }
  try {
    if (!(await ownsProspect(id, user.email))) {
      return { ok: false, message: NOT_THE_OWNER_MESSAGE };
    }
  } catch (error) {
    console.error("ownership check failed", error);
    return {
      ok: false,
      message: isDatabaseUnreachable(error)
        ? DATABASE_DOWN_MESSAGE
        : "Could not check who owns this prospect. Please try again.",
    };
  }
  return null;
}

export async function saveProspectCta(
  id: string,
  input: CtaInput,
): Promise<SaveCtaResult> {
  const refusal = await blocked(id);
  if (refusal) return refusal;

  const parsed = ctaInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: getCtaFieldErrors(parsed.error),
    };
  }

  return saveCta(id, parsed.data);
}

export async function publishProspect(id: string): Promise<MutationResult> {
  const refusal = await blocked(id);
  if (refusal) return refusal;
  return setPublished(id, true);
}

export async function unpublishProspect(id: string): Promise<MutationResult> {
  const refusal = await blocked(id);
  if (refusal) return refusal;
  return setPublished(id, false);
}

/**
 * Writes this prospect's published link onto its HubSpot contact.
 *
 * Separate from `publishProspect` on purpose, and always called after it: the
 * SDR is asked, and a "no" simply never reaches here. Nothing about publishing
 * depends on this succeeding.
 *
 * Behind the same owner gate as every other write. It changes a record in the
 * company's CRM, so it is at least as sensitive as editing the prospect itself.
 * The token is read server-side inside `syncProspectToHubspot` and never leaves
 * this process. Safe to call more than once.
 */
export async function addProspectToHubspot(
  id: string,
  /** Supplied when the SDR is linking the contact at publish time, not on the form. */
  contactUrl?: string,
): Promise<MutationResult> {
  const refusal = await blocked(id);
  if (refusal) return refusal;
  return syncProspectToHubspot(
    id,
    typeof contactUrl === "string" ? contactUrl.slice(0, 500) : undefined,
  );
}

/** The tracking popup's Save. The fields are re-checked in `saveTrackingDetails`. */
export async function confirmProspectTracking(
  id: string,
  fields: { sdrName: string; prospectName: string; prospectEmail: string },
): Promise<MutationResult> {
  const refusal = await blocked(id);
  if (refusal) return refusal;
  return saveTrackingDetails(id, fields);
}
