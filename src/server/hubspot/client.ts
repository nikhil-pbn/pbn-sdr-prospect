import "server-only";

/**
 * HubSpot configuration. Server-only, and deliberately so: `HUBSPOT_ACCESS_TOKEN`
 * can read and write the whole company's CRM, so it must never be prefixed with
 * NEXT_PUBLIC_ and never reach a Client Component. The integration is called
 * from a Server Action for exactly that reason.
 *
 * A private-app token rather than OAuth, because this is one company's own
 * portal — there is no "connect your HubSpot account" step for anyone to
 * complete. Create it under Settings → Integrations → Private Apps with the
 * `crm.objects.contacts.write` scope; the value starts with `pat-`.
 *
 * Read from `process.env` on each call rather than captured in a module
 * constant: `next build` imports server modules while prerendering, and the
 * token isn't necessarily present at build time.
 *
 * Same portal as PbN Proposals, so the same token works for both tools — but a
 * DIFFERENT contact property, so a prospect link never overwrites a proposal
 * link on the same contact.
 */

/**
 * The internal name of the Contact property the link is written to — the value
 * HubSpot shows under Settings → Properties, not its display label.
 *
 * Configurable because it is created by hand in HubSpot and only then known for
 * certain. `sdr_prospect_link` is the property created in the portal for this
 * tool (2026-09-04), so it is the default rather than an assumption to verify.
 */
const DEFAULT_PROPERTY = "sdr_prospect_link";

export function prospectLinkProperty(): string {
  return process.env.HUBSPOT_PROSPECT_LINK_PROPERTY?.trim() || DEFAULT_PROPERTY;
}

/** True when a token is configured. Lets the caller explain a miss precisely. */
export function hasHubspotToken(): boolean {
  return Boolean(process.env.HUBSPOT_ACCESS_TOKEN?.trim());
}

/** The token, or an error phrased for whoever has to fix the deployment. */
export function hubspotToken(): string {
  const token = process.env.HUBSPOT_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "HUBSPOT_ACCESS_TOKEN is not set. Add it to .env (server-side only — never " +
        "prefix it with NEXT_PUBLIC_).",
    );
  }
  return token;
}
