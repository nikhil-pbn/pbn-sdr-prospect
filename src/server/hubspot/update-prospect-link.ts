import "server-only";
import { hubspotToken, prospectLinkProperty } from "./client";

/**
 * Writes a prospect's public link onto one HubSpot contact.
 *
 * A PATCH of a single property on an existing record — never a create and never
 * a search. The contact id came from a URL the SDR was already looking at, so
 * there is nothing to match on and no way to end up with a duplicate contact.
 * Sending the same link twice is a no-op, which is what makes the confirmation
 * dialog safe to retry.
 *
 * Returns a result rather than throwing, because the caller has already
 * published the prospect by this point: a HubSpot failure is something to
 * report, not something that may unwind the operation that succeeded.
 */

export type HubspotResult = { ok: true } | { ok: false; message: string };

const CONTACTS = "https://api.hubapi.com/crm/v3/objects/contacts";

/** An SDR is watching a spinner. Ten seconds, then say so and move on. */
const TIMEOUT_MS = 10_000;

export async function updateHubspotProspectLink({
  contactId,
  prospectUrl,
}: {
  contactId: string;
  prospectUrl: string;
}): Promise<HubspotResult> {
  let token: string;
  try {
    token = hubspotToken();
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  const property = prospectLinkProperty();

  let response: Response;
  try {
    response = await fetch(`${CONTACTS}/${encodeURIComponent(contactId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties: { [property]: prospectUrl } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    // Timeout and DNS/connection failures land here. The PATCH may in principle
    // have been applied, which is harmless — it is the same value either way.
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return {
      ok: false,
      message: timedOut
        ? "HubSpot didn't answer within ten seconds."
        : `Couldn't reach HubSpot: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  if (response.ok) return { ok: true };

  return { ok: false, message: await failureMessage(response, property) };
}

/**
 * HubSpot's own message, prefixed with what the status code actually means for
 * us. Every one of these is a different person's job to fix, and the raw body
 * says "BLOCKED" or "PROPERTY_DOESNT_EXIST" without saying where to go.
 */
async function failureMessage(
  response: Response,
  property: string,
): Promise<string> {
  const detail = await hubspotMessage(response);

  switch (response.status) {
    case 400:
      return (
        `HubSpot rejected the update — check that a contact property with the ` +
        `internal name "${property}" exists. ${detail}`
      );
    case 401:
    case 403:
      return (
        "HubSpot refused the token. It must be a private-app token (it starts " +
        `with "pat-") carrying the crm.objects.contacts.write scope. ${detail}`
      );
    case 404:
      return `That contact no longer exists in HubSpot. ${detail}`;
    case 429:
      return `HubSpot is rate-limiting us. Try again in a minute. ${detail}`;
    default:
      return `HubSpot returned ${response.status}. ${detail}`;
  }
}

/** The `message` field HubSpot returns, or the raw body if it isn't JSON. */
async function hubspotMessage(response: Response): Promise<string> {
  let body: string;
  try {
    body = await response.text();
  } catch {
    return "";
  }

  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === "object" && "message" in parsed) {
      return String((parsed as { message?: unknown }).message ?? "");
    }
  } catch {
    // Not JSON — an HTML error page from a proxy, most likely.
  }

  return body.slice(0, 300);
}
