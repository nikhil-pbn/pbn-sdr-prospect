import type { SeedEntry } from "../shared";

/**
 * PbN AI Receptionist — category, sortOrder 10.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-03.
 *
 * Edit here, then `npm run db:seed` to publish the change. The body is an
 * ordered list of blocks — text, inline, tiles, grid, bullets — each with its
 * own heading (empty for none); reorder or drop blocks freely. Field limits are
 * in src/types/section-content.ts.
 */
export const PBN_AI_RECEPTIONIST: SeedEntry = {
  slug: "pbn-ai-receptionist",
  name: "PbN AI Receptionist",
  sortOrder: 10,
  content: {
    eyebrow: "PbN AI Receptionist Solution",
    title: "Give Every Patient an Immediate, Consistent Response",
    subtitle:
      "Extend front-desk coverage across voice and text while keeping your team in control of scheduling, answers, escalations, and performance visibility.",
    blocks: [
      {
        type: "inline",
        heading: "Does this sound familiar?",
        separator: "|",
        items: [
          "Calls and messages go unanswered when the team is busy or the office is closed.",
          "Routine questions and appointment requests consume front-desk capacity.",
          "Leaders lack visibility into what the AI handled, booked, or escalated.",
        ],
      },
      {
        type: "tiles",
        heading: "How Practice by Numbers helps",
        items: [
          {
            label: "Respond",
            text: "Engage patients through configured voice and text coverage.",
          },
          {
            label: "Resolve",
            text: "Handle routine questions and appointment needs.",
          },
          {
            label: "Reveal",
            text: "Track interactions, bookings, resolution, and knowledge gaps",
          },
        ],
      },
      {
        type: "grid",
        heading: "Core capabilities",
        items: [
          {
            name: "Voice & SMS Coverage",
            description: "Respond according to configured channels and hours",
          },
          {
            name: "Appointment Assistance",
            description: "Help patients book, confirm, cancel, or reschedule",
          },
          {
            name: "Practice Knowledge Base",
            description:
              "Answer common questions using approved practice information",
          },
          {
            name: "Personalized Greetings",
            description: "Recognize new and returning patients where supported",
          },
          {
            name: "Escalation & Override",
            description:
              "Route to staff, capture voicemail, or allow manual takeover",
          },
          {
            name: "AI Receptionist Analytics",
            description:
              "Review interactions, bookings, resolution, and knowledge gaps",
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
        text: "Practices with missed-call pressure, after-hours demand, repetitive patient questions, or limited front-desk capacity",
      },
      {
        type: "inline",
        heading: "What changes",
        separator: "|",
        items: [
          "Broader patient coverage",
          "More capacity for the front desk",
          "Clearer AI performance visibility",
        ],
      },
    ],
  },
};
