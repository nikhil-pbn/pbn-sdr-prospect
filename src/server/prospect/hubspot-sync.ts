import "server-only";
import { HubspotSyncStatus, prisma, ProspectStatus } from "@/server/db";
import { updateHubspotProspectLink } from "@/server/hubspot/update-prospect-link";
import { hubspotContactIdFrom } from "@/utils/hubspot-contact-url";
import { prospectUrlFor } from "@/utils/prospect-url";
import type { MutationResult } from "./results";

/**
 * Pushes a published prospect's link to its HubSpot contact, and records what
 * happened.
 *
 * Runs only after publish, never as part of it. The prospect is already live
 * and already saved when this is called, so every failure below is reported and
 * nothing is rolled back — HubSpot being down is not a reason for a dentist to
 * wait for their page.
 *
 * The link is derived with `prospectUrlFor`, the same function the toolbar
 * copies and the tracking dialog displays, so the three can never disagree.
 *
 * Idempotent, which is what allows the caller to offer a retry: writing the
 * same property value to the same contact twice changes nothing.
 */
export async function syncProspectToHubspot(
  id: string,
  /**
   * A contact URL supplied at publish time by an SDR who didn't paste one on the
   * form. Stored before anything is pushed, so a HubSpot outage doesn't lose it
   * and the retry needs no second paste. Ignored when a contact is already
   * linked — repointing a prospect at a different record is a separate, riskier
   * thing.
   */
  contactUrl?: string,
): Promise<MutationResult> {
  let prospect;
  try {
    prospect = await prisma.prospect.findUnique({
      where: { id },
      select: { slug: true, status: true, hubspotContactId: true },
    });
  } catch (error) {
    console.error("syncProspectToHubspot lookup failed", error);
    return { ok: false, message: "Could not read the prospect." };
  }

  if (!prospect)
    return { ok: false, message: "That prospect no longer exists." };

  // A guard, not a convenience. Publishing is what creates the link this
  // writes, so running early would put a URL that 404s into the CRM.
  if (prospect.status !== ProspectStatus.Published) {
    return {
      ok: false,
      message: "Publish the prospect first — HubSpot needs a live link.",
    };
  }

  const contactId =
    prospect.hubspotContactId ?? (await link(id, contactUrl?.trim()));

  if (!contactId) {
    return {
      ok: false,
      message:
        "No HubSpot contact is linked to this prospect. Paste the contact's " +
        "HubSpot URL and try again.",
    };
  }

  const result = await updateHubspotProspectLink({
    contactId,
    prospectUrl: prospectUrlFor(prospect.slug),
  });

  await record(id, result);
  return result;
}

/**
 * Attaches a contact to a prospect that had none, returning its id.
 *
 * Written to the row BEFORE the push is attempted: the id is a fact about the
 * lead, true whether or not HubSpot answers. Persisting it first is what turns
 * a failed attempt into a one-click retry instead of asking the SDR to find
 * that URL a second time.
 */
async function link(id: string, url?: string): Promise<string | null> {
  const contactId = url ? hubspotContactIdFrom(url) : null;
  if (!contactId) return null;

  try {
    await prisma.prospect.update({
      where: { id },
      data: { hubspotContactId: contactId },
    });
  } catch (error) {
    console.error("linking the HubSpot contact failed", error);
    return null;
  }
  return contactId;
}

/**
 * Stores the outcome. Its own try/catch: the HubSpot call has already happened
 * by now, so failing to write the audit column must not turn a successful sync
 * into a reported failure.
 */
async function record(id: string, result: MutationResult): Promise<void> {
  try {
    await prisma.prospect.update({
      where: { id },
      data: {
        hubspotStatus: result.ok
          ? HubspotSyncStatus.Added
          : HubspotSyncStatus.Failed,
        hubspotSyncedAt: new Date(),
        // Cleared on success, so a row never carries the reason for an attempt
        // that has since been fixed. Trimmed to the column width.
        hubspotError: result.ok ? null : result.message.slice(0, 500),
      },
    });
  } catch (error) {
    console.error("recording the HubSpot outcome failed", error);
  }
}
