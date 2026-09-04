/**
 * What a new prospect's CTA block starts as. The SDR may change all four fields
 * in the editor — this is only the default, not the content.
 *
 * Title and description are the template's. The price is PbN's published
 * starting price ($249/month, Analyze plan). The template's button reads
 * "See Pricing"; here it reads "Book a Demo" because the brief routes the button
 * to the SDR's calendar, and a pricing label on a booking link would mislead.
 * Change the default here if the business prefers otherwise.
 */
export function defaultCta(calendarHref: string) {
  return {
    title: "Get started from just $249/month",
    description: "No hidden charges, no unnecessary features",
    buttonText: "Book a Demo",
    url: calendarHref,
  };
}
