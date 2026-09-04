/**
 * Reads the contact id out of a HubSpot URL a rep pasted from their address bar.
 *
 * The id is the only thing the CRM API needs, and it is the only part of the URL
 * that differs per lead — the portal id in front of it is the same for the whole
 * company. Storing the id rather than asking a rep to find it themselves is the
 * difference between one paste and a support question.
 *
 * Two shapes are in circulation, so both are read:
 *
 *   https://app.hubspot.com/contacts/21924079/contact/123456789
 *   https://app.hubspot.com/contacts/21924079/record/0-1/123456789
 *
 * Parsed with `URL` and matched by path SEGMENT, never by substring: a hardcoded
 * `split("/contact/")[1]` picks up the trailing `/emails` that HubSpot appends
 * when you navigate inside a record, and would send the API a non-numeric id.
 * Reading the path also means the `?eschref=…` breadcrumb HubSpot adds when you
 * arrive from a list view is ignored — it holds an encoded copy of that list's
 * own path, which a substring search would happily mistake for the record.
 *
 * Returns null for anything it cannot read, including an empty string. The field
 * is optional, so null is an ordinary answer and not an error.
 */

/** hubspot.com, or a regional subdomain of it — app-eu1, app-na2, and so on. */
const HOST = /(^|\.)hubspot\.com$/i;

/** A CRM record id is digits. Bounded so a long numeric path can't pass as one. */
const RECORD_ID = /^\d{1,20}$/;

/** HubSpot's object-type ids: 0-1 contacts, 0-2 companies, 0-3 deals, 2-x custom. */
const OBJECT_TYPE = /^\d+-\d+$/;
const CONTACTS = "0-1";

export function hubspotContactIdFrom(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    // Copying from the address bar sometimes drops the scheme, and "app.hubspot.com/…"
    // is not a URL without one.
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  if (!HOST.test(url.hostname)) return null;

  const segments = url.pathname.split("/").filter(Boolean);
  const contacts = segments.indexOf("contacts");
  if (contacts === -1) return null;

  // The segment that announces a single record. Anything before it is the portal.
  const marker = segments.findIndex(
    (segment, index) =>
      index > contacts && (segment === "contact" || segment === "record"),
  );
  if (marker === -1) return null;

  const after = segments.slice(marker + 1);

  // A `record` URL names its object type first, and every object in HubSpot lives
  // under /contacts/ — so a company or deal page is one wrong click away and its
  // id is digits too. Left unchecked it would store cleanly, publish cleanly, and
  // surface as a 404 from the contacts endpoint long after the rep moved on.
  if (OBJECT_TYPE.test(after[0] ?? "") && after[0] !== CONTACTS) return null;

  // First numeric segment after the marker: skips the `0-1` object-type segment in
  // the newer shape, and stops before any `/emails` tab suffix in either.
  return after.find((s) => RECORD_ID.test(s)) ?? null;
}

/** For form validation — a blank value is handled by the caller, not here. */
export function isHubspotContactUrl(value: string): boolean {
  return hubspotContactIdFrom(value) !== null;
}
