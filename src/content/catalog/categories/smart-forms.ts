import type { CatalogEntry } from "../shared";

/**
 * Smart Forms — category, sortOrder 9.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-03.
 *
 * Edit here; the change ships with the next deploy. The body is an
 * ordered list of blocks — text, inline, tiles, grid, bullets — each with its
 * own heading (empty for none); reorder or drop blocks freely. Field limits are
 * in src/types/section-content.ts.
 */
export const SMART_FORMS: CatalogEntry = {
  slug: "smart-forms",
  name: "Smart Forms",
  sortOrder: 9,
  content: {
    eyebrow: "Smart Forms Solution",
    title: "Replace Paper Forms and Repetitive Patient Intake Work",
    subtitle:
      "Create, send, complete, track, and write back digital patient forms through a workflow designed for dental practices",
    blocks: [
      {
        type: "inline",
        heading: "Does this sound familiar?",
        separator: "|",
        items: [
          "Patients arrive with incomplete paperwork, creating delays at check-in.",
          "Staff spend time sending forms, chasing responses, and re-entering information.",
          "Generic form tools do not match the practice's intake, consent, or clinical work",
        ],
      },
      {
        type: "tiles",
        heading: "How Practice by Numbers helps",
        items: [
          {
            label: "Customize",
            text: "Build patient-friendly forms around the practice's requirements.",
          },
          {
            label: "Automate",
            text: "Send forms and reminders based on configured appointment workflows.",
          },
          {
            label: "Connect",
            text: "Track completion and return information to supported practice systems.",
          },
        ],
      },
      {
        type: "grid",
        heading: "Core capabilities",
        items: [
          {
            name: "Custom Form Builder",
            description:
              "Create intake, medical history, consent, and other forms",
          },
          {
            name: "Automated Delivery",
            description: "Send configured forms through email or SMS workflows",
          },
          {
            name: "Remote Completion",
            description:
              "Let patients complete responsive forms before the visit",
          },
          {
            name: "Kiosk & Tablet Check-In",
            description: "Support secure in-office form completion",
          },
          {
            name: "Remote Completion",
            description:
              "Let patients complete responsive forms before the visit",
          },
          {
            name: "PMS Writeback",
            description:
              "Return completed forms and supported mapped data to the patient chart",
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
        text: "Practices that want a faster check-in experience, less manual data entry, and more consistent intake workflows.",
      },
      {
        type: "inline",
        heading: "What changes",
        separator: "|",
        items: [
          "Less paper and duplicate entry",
          "More forms completed before arrival",
          "A smoother patient check-in",
        ],
      },
    ],
  },
};
