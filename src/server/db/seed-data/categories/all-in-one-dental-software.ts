import type { SeedEntry } from "../shared";

/**
 * The All-in-One Dental Software — category, sortOrder 1.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-03.
 *
 * Edit here, then `npm run db:seed` to publish the change. The body is an
 * ordered list of blocks — text, inline, tiles, grid, bullets — each with its
 * own heading (empty for none); reorder or drop blocks freely. Field limits are
 * in src/types/section-content.ts.
 */
export const ALL_IN_ONE_DENTAL_SOFTWARE: SeedEntry = {
  slug: "all-in-one-dental-software",
  name: "The All-in-One Dental Software",
  sortOrder: 1,
  content: {
    eyebrow: "The All-in-One Dental Software",
    title: "One Connected Platform. Fewer Disconnected Tools.",
    subtitle:
      "Practice by Numbers connects performance, patient relationships, operations, marketing, calls, AI, and payments around the way a dental practice works.",
    blocks: [
      {
        type: "text",
        heading: "Start with the problem. expand as the practice grows.",
        text: "PbN is designed as a modular platform: practices can address a priority workflow first, then bring more of the patient and practice journey into one connected environment.",
      },
      {
        type: "grid",
        heading: "Core capabilities",
        items: [
          {
            name: "Business Analytics",
            description:
              "See performance clearly and act on revenue opportunities.",
          },
          {
            name: "Patient Relationship Management",
            description: "Coordinate communication, recall, and follow-up",
          },
          {
            name: "Operational efficiency",
            description: "Reduce administrative work and standardize execution",
          },
          {
            name: "PbN AI",
            description:
              "Extend coverage, surface insight, and automate repetitive work.",
          },
          {
            name: "PbN Voice",
            description:
              "Connect calling, texting, routing, and patient context.",
          },
          {
            name: "PbN Payments",
            description: "Simplify how patients pay and practices collect",
          },
          {
            name: "Dental Marketing",
            description:
              "Connect acquisition, conversion, reputation, and ROI visibility",
          },
        ],
      },
      {
        type: "tiles",
        heading: "What a connected platform changes",
        items: [
          {
            label: "Clarity",
            text: "See more of the practice without assembling disconnected reports.",
          },
          {
            label: "Consistency",
            text: "Build repeatable patient and team workflows.",
          },
          {
            label: "Control",
            text: "Start with the highest-priority need and expand deliberately.",
          },
        ],
      },
      {
        type: "inline",
        heading: "A simple way to explore PbN",
        separator: "|",
        items: [
          "Choose the business problem creating the most friction.",
          "See the relevant workflow in a personalized demo.",
          "Define success criteria, integration needs, and the right starting scope.",
        ],
      },
      {
        type: "text",
        heading: "Best fit",
        text: "Single practices, growing groups, and multi-location organizations seeking fewer disconnected systems.",
      },
      {
        type: "bullets",
        heading: "What changes",
        items: [
          "Fewer logins and handoffs",
          "More connected practice visibility",
          "A platform that can expand by need",
        ],
      },
    ],
  },
};
