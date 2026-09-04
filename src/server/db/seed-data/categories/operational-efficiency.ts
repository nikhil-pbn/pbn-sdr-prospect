import type { SeedEntry } from "../shared";

/**
 * Operational Efficiency — category, sortOrder 4.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-03.
 *
 * Edit here, then `npm run db:seed` to publish the change. The body is an
 * ordered list of blocks — text, inline, tiles, grid, bullets — each with its
 * own heading (empty for none); reorder or drop blocks freely. Field limits are
 * in src/types/section-content.ts.
 */
export const OPERATIONAL_EFFICIENCY: SeedEntry = {
  slug: "operational-efficiency",
  name: "Operational Efficiency",
  sortOrder: 4,
  content: {
    eyebrow: "Operational Efficiency Solution",
    title: "Reduce Administrative Work Across the Practice",
    subtitle:
      "Standardize daily work, digitize patient intake, and automate repetitive processes that slow the team down.",
    blocks: [
      {
        type: "inline",
        heading: "Does this sound familiar?",
        separator: "|",
        items: [
          "Confirmations and follow-up consume front-desk time.",
          "Recall, reactivation, and treatment opportunities go cold.",
          "Patient communication is fragmented across multiple tools.",
        ],
      },
      {
        type: "tiles",
        heading: "How Practice by Numbers helps",
        items: [
          {
            label: "Reach",
            text: "Connect through text, email, and automated campaigns.",
          },
          {
            label: "Respond",
            text: "Keep two-way patient conversations organized.",
          },
          {
            label: "Retain",
            text: "Build consistent recall, reactivation, and treatment follow-up.",
          },
        ],
      },
      {
        type: "grid",
        heading: "Core capabilities",
        items: [
          {
            name: "Patient Reminders",
            description: "Automate appointment reminders and confirmations",
          },
          {
            name: "Two-Way Texting",
            description: "Manage convenient patient conversations",
          },
          {
            name: "Follow-Up Campaigns",
            description: "Support recall, reactivation, and treatment outreach",
          },
          {
            name: "Campaign Builder",
            description: "Run essential, advanced, and custom campaigns",
          },
          {
            name: "Patient Portal",
            description:
              "Give patients access to forms, bills, and visit information",
          },
          {
            name: "Patient Reviews",
            description: "Request and manage patient feedback",
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
        text: "Practices that want fewer manual touchpoints and a more consistent patient communication experience.",
      },
      {
        type: "inline",
        heading: "What changes",
        separator: "|",
        items: [
          "Less manual outreach",
          "More consistent follow-up",
          "A connected patient experience",
        ],
      },
    ],
  },
};
