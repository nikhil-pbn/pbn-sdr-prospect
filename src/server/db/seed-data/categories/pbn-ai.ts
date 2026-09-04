import type { SeedEntry } from "../shared";

/**
 * PbN AI — category, sortOrder 5.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-03.
 *
 * Edit here, then `npm run db:seed` to publish the change. The body is an
 * ordered list of blocks — text, inline, tiles, grid, bullets — each with its
 * own heading (empty for none); reorder or drop blocks freely. Field limits are
 * in src/types/section-content.ts.
 */
export const PBN_AI: SeedEntry = {
  slug: "pbn-ai",
  name: "PbN AI",
  sortOrder: 5,
  content: {
    eyebrow: "PbN AI Solution",
    title: "Add an Intelligent Workforce to Your Dental Practice",
    subtitle:
      "Extend patient coverage, automate repetitive work, and create visibility into conversations and execution.",
    blocks: [
      {
        type: "inline",
        heading: "Does this sound familiar?",
        separator: "|",
        items: [
          "Calls and patient needs exceed available front-desk capacity.",
          "Leaders lack visibility into how conversations are handled.",
          "Repetitive work limits time available for patients and growth.",
        ],
      },
      {
        type: "tiles",
        heading: "How Practice by Numbers helps",
        items: [
          {
            label: "Cover",
            text: "Support patient needs beyond the team's available capacity.",
          },
          {
            label: "Understand",
            text: "Turn conversations and activity into usable insight.",
          },
          {
            label: "Automate",
            text: "Reduce repetitive administrative execution.",
          },
        ],
      },
      {
        type: "grid",
        heading: "Core capabilities",
        items: [
          {
            name: "AI Receptionist",
            description:
              "Handle defined patient call workflows around the clock",
          },
          {
            name: "Call AI",
            description: "Review and understand patient call activity",
          },
          {
            name: "Ops AI",
            description: "Automate selected administrative workflows",
          },
          {
            name: "IntelliSuite",
            description: "Bring AI capabilities together across the practice",
          },
          {
            name: "Conversation Visibility",
            description: "Give owners greater insight into call handling",
          },
          {
            name: "Connected Context",
            description: "Work within the broader PbN practice platform",
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
        text: "Practices facing staffing pressure, missed calls, inconsistent call handling, or repetitive administrative work.",
      },
      {
        type: "inline",
        heading: "What changes",
        separator: "|",
        items: [
          "Extended patient coverage",
          "Greater operational visibility",
          "More team capacity",
        ],
      },
    ],
  },
};
