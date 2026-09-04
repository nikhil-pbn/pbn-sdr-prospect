import type { CatalogEntry } from "../shared";

/**
 * Business Analytics — category, sortOrder 2.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-03.
 *
 * Edit here; the change ships with the next deploy. The body is an
 * ordered list of blocks — text, inline, tiles, grid, bullets — each with its
 * own heading (empty for none); reorder or drop blocks freely. Field limits are
 * in src/types/section-content.ts.
 */
export const BUSINESS_ANALYTICS: CatalogEntry = {
  slug: "business-analytics",
  name: "Business Analytics",
  sortOrder: 2,
  content: {
    eyebrow: "Business Analytics Solution",
    title: "Turn Practice Data Into Decisions and Revenue",
    subtitle:
      "Bring performance, opportunity, and accountability into one clear view, without spending hours building reports.",
    blocks: [
      {
        type: "inline",
        heading: "Does this sound familiar?",
        separator: "|",
        items: [
          "Reports take too long to build and interpret",
          "Revenue opportunities are discovered too late",
          "Provider, team, or location performance is difficult to compare",
        ],
      },
      {
        type: "tiles",
        heading: "How Practice by Numbers helps",
        items: [
          {
            label: "See",
            text: "Monitor the KPIs that matter across the practice",
          },
          {
            label: "Understand",
            text: "Spot trends, gaps, and performance drivers.",
          },
          {
            label: "Act",
            text: "Turn insights into goals and revenue-focused follow-up",
          },
        ],
      },
      {
        type: "grid",
        heading: "Core capabilities",
        items: [
          {
            name: "Practice IQ",
            description:
              "Custom dashboards and practice performance visibility",
          },
          {
            name: "Revenue IQ",
            description:
              "Identify and organize actionable revenue opportunities",
          },
          {
            name: "Goals & KPIs",
            description: "Align teams around measurable targets",
          },
          {
            name: "Provider Performance",
            description: "Compare production and operating performance",
          },
          {
            name: "Enterprise Dashboard",
            description: "Roll-up visibility across multiple locations",
          },
          {
            name: "Practice Access",
            description:
              "Review performance remotely without relying on static reports",
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
        text: "Owners, office managers, and multi-location leaders who want consistent visibility and accountability.",
      },
      {
        type: "bullets",
        heading: "What changes",
        items: [
          "Faster performance reviews",
          "Earlier visibility into gaps",
          "More focused revenue follow-up",
        ],
      },
    ],
  },
};
