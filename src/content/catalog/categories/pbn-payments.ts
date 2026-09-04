import type { CatalogEntry } from "../shared";

/**
 * PbN Payments — category, sortOrder 8.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-03.
 *
 * Edit here; the change ships with the next deploy. The body is an
 * ordered list of blocks — text, inline, tiles, grid, bullets — each with its
 * own heading (empty for none); reorder or drop blocks freely. Field limits are
 * in src/types/section-content.ts.
 */
export const PBN_PAYMENTS: CatalogEntry = {
  slug: "pbn-payments",
  name: "PbN Payments",
  sortOrder: 8,
  content: {
    eyebrow: "PbN Payments Solution",
    title: "Make It Easier for Patients to Pay and Practices to Collect",
    subtitle:
      "Connect in-office, remote, and flexible payment experiences with practice workflows.",
    blocks: [
      {
        type: "inline",
        heading: "Does this sound familiar?",
        separator: "|",
        items: [
          "Payment collection is fragmented across channels and tools.",
          "Patient balances require repeated manual follow-up.",
          "Patients need more convenient or flexible ways to pay.",
        ],
      },
      {
        type: "tiles",
        heading: "How Practice by Numbers helps",
        items: [
          {
            label: "Accept",
            text: "Collect payments in the office and beyond it.",
          },
          {
            label: "Offer",
            text: "Give patients more convenient payment options.",
          },
          {
            label: "Simplify",
            text: "Reduce friction across payment and collection workflows.",
          },
        ],
      },
      {
        type: "grid",
        heading: "Core capabilities",
        items: [
          {
            name: "In-Office Payments",
            description:
              "Accept payments through an integrated point-of-sale experience",
          },
          {
            name: "Anywhere Payments",
            description: "Collect remotely through digital payment workflows",
          },
          {
            name: "Payment Plans",
            description: "Offer structured affordability options",
          },
          {
            name: "PbN ZeroPay",
            description:
              "Support an approved surcharge-based program where eligible",
          },
          {
            name: "Patient Experience",
            description: "Make payment steps clearer and more convenient",
          },
          {
            name: "Connected Workflows",
            description: "Keep payment activity closer to practice operations",
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
        text: "Practices that want simpler collection workflows, flexible patient options, and fewer disconnected payment tools.",
      },
      {
        type: "inline",
        heading: "What changes",
        separator: "|",
        items: [
          "More payment convenience",
          "Less collection friction",
          "A more connected workflow",
        ],
      },
    ],
  },
};
