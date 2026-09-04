import type { SeedEntry } from "../shared";

/**
 * PbN Voice — category, sortOrder 6.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-03.
 *
 * Edit here, then `npm run db:seed` to publish the change. The body is an
 * ordered list of blocks — text, inline, tiles, grid, bullets — each with its
 * own heading (empty for none); reorder or drop blocks freely. Field limits are
 * in src/types/section-content.ts.
 */
export const PBN_VOICE: SeedEntry = {
  slug: "pbn-voice",
  name: "PbN Voice",
  sortOrder: 6,
  content: {
    eyebrow: "PbN Voice Solution",
    title: "Turn Every Patient Call Into a Connected Practice Experience",
    subtitle:
      "Bring calling, texting, routing, patient context, and performance visibility into one dental-focused phone system.",
    blocks: [
      {
        type: "inline",
        heading: "Does this sound familiar?",
        separator: "|",
        items: [
          "Missed calls are difficult to identify and recover.",
          "Patient context is unavailable when the phone rings.",
          "Phone, text, and practice activity live in disconnected systems.",
        ],
      },
      {
        type: "tiles",
        heading: "How Practice by Numbers helps",
        items: [
          {
            label: "Connect",
            text: "Use cloud calling and texting across desktop, mobile, or desk phones.",
          },
          {
            label: "Recognize",
            text: "Surface patient details when calls arrive.",
          },
          {
            label: "Improve",
            text: "Use recordings and analytics for follow-up and coaching.",
          },
        ],
      },
      {
        type: "grid",
        heading: "Core capabilities",
        items: [
          {
            name: "Cloud VoIP",
            description: "Support desk phones, softphones, or a blended setup",
          },
          {
            name: "Call Pop",
            description: "Show relevant patient details on incoming calls",
          },
          {
            name: "Smart Routing & IVR",
            description: "Direct calls by team, department, hours, or need",
          },
          {
            name: "Call Recording",
            description: "Support training and quality review",
          },
          {
            name: "Call Analytics",
            description: "Track activity, missed calls, and call patterns",
          },
          {
            name: "Business Texting",
            description: "Keep calls and texts connected to patient activity",
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
        text: "Dental practices replacing an outdated phone system or seeking better call visibility and connected patient context.",
      },
      {
        type: "inline",
        heading: "What changes",
        separator: "|",
        items: [
          "Fewer disconnected calls",
          "Faster patient recognition",
          "Better coaching visibility",
        ],
      },
    ],
  },
};
