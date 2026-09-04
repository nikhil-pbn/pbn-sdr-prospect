import type { CatalogEntry } from "../shared";

/**
 * Patient Relationship Management — category, sortOrder 3.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-03.
 *
 * Edit here; the change ships with the next deploy. The body is an
 * ordered list of blocks — text, inline, tiles, grid, bullets — each with its
 * own heading (empty for none); reorder or drop blocks freely. Field limits are
 * in src/types/section-content.ts.
 */
export const PATIENT_RELATIONSHIP_MANAGEMENT: CatalogEntry = {
  slug: "patient-relationship-management",
  name: "Patient Relationship Management",
  sortOrder: 3,
  content: {
    eyebrow: "Patient Relationship Management Solution",
    title: "Keep Patients Engaged Before, Between, and After Visits",
    subtitle:
      "Connect reminders, conversations, follow-up, and patient access so fewer opportunities fall through the cracks.",
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
