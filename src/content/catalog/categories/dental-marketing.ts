import type { CatalogEntry } from "../shared";

/**
 * Dental Marketing — category, sortOrder 7.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-03.
 *
 * Edit here; the change ships with the next deploy. The body is an
 * ordered list of blocks — text, inline, tiles, grid, bullets — each with its
 * own heading (empty for none); reorder or drop blocks freely. Field limits are
 * in src/types/section-content.ts.
 */
export const DENTAL_MARKETING: CatalogEntry = {
  slug: "dental-marketing",
  name: "Dental Marketing",
  sortOrder: 7,
  content: {
    eyebrow: "Dental Marketing Solution",
    title: "See Which Marketing Efforts Bring Patients and Revenue",
    subtitle:
      "Connect acquisition, conversion, reputation, and ROI visibility so marketing decisions are based on outcomes, not assumptions.",
    blocks: [
      {
        type: "inline",
        heading: "Does this sound familiar?",
        separator: "|",
        items: [
          "Leads and booked patients are difficult to connect to a source.",
          "The practice lacks confidence in marketing ROI.",
          "Website visitors and happy patients are not consistently converted into action.",
        ],
      },
      {
        type: "tiles",
        heading: "How Practice by Numbers helps",
        items: [
          {
            label: "Attract",
            text: "Create more ways for prospective patients to engage.",
          },
          {
            label: "Convert",
            text: "Move interest toward conversations and appointments.",
          },
          {
            label: "Measure",
            text: "Understand which sources and campaigns contribute to results.",
          },
        ],
      },
      {
        type: "grid",
        heading: "Core capabilities",
        items: [
          {
            name: "Marketing IQ",
            description: "Monitor marketing performance in one view",
          },
          {
            name: "Marketing ROI",
            description: "Connect investment with practice outcomes",
          },
          {
            name: "Call & Lead Tracking",
            description: "Improve source and conversion visibility",
          },
          {
            name: "Online Booking",
            description: "Let prospects schedule when interest is highest",
          },
          {
            name: "Web Chat",
            description: "Give website visitors an immediate engagement path",
          },
          {
            name: "Review Management",
            description: "Build a consistent patient review process",
          },
        ],
      },
      {
        type: "inline",
        heading: "Built to work with your practice",
        separator: "•",
        items: [
          "Designed for dental workflows",
          "Connects with supported practice management systems",
          "Suitable for single and multi-location organizations",
          "Guided onboarding and support",
        ],
      },
      {
        type: "text",
        heading: "Best fit",
        text: "Growth-focused practices that want clearer attribution, stronger online conversion, and a more consistent reputation workflow.",
      },
      {
        type: "inline",
        heading: "What changes",
        separator: "|",
        items: [
          "Clearer marketing decisions",
          "More conversion paths",
          "Stronger ROI visibility",
        ],
      },
    ],
  },
};
