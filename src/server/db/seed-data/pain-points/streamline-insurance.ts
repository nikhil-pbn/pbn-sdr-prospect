import { cap, problemCard, tile } from "./card";

/**
 * Streamline Insurance — pain point, sortOrder 8.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-04. Edit here, then `npm run db:seed`.
 */
export const STREAMLINE_INSURANCE = problemCard({
  slug: "streamline-insurance",
  name: "Streamline Insurance",
  sortOrder: 8,
  title: "Spend Less Time Verifying Insurance Manually",
  subtitle:
    "Create a more consistent eligibility and benefits workflow with clearer information, ownership, and patient intake.",
  showsUp: [
    "Staff spend hours checking portals or calling payers.",
    "Verification is completed late or inconsistently.",
    "Missing information creates patient confusion and front-desk rework.",
  ],
  change: [
    tile(
      "Collect",
      "Capture the right patient and insurance information earlier.",
    ),
    tile("Verify", "Reduce repetitive eligibility and benefits work."),
    tile(
      "Organize",
      "Give the team clearer status, ownership, and next actions",
    ),
  ],
  help: [
    cap(
      "Insurance Verification",
      "Support PMS-integrated eligibility and benefits workflows",
    ),
    cap("Smart Forms", "Collect insurance and patient information digitally"),
    cap("Patient Portal", "Give patients a convenient information-access path"),
    cap("Advanced Tasks", "Assign exceptions and track completion"),
    cap(
      "Online Booking Questions",
      "Capture relevant information earlier in the journey",
    ),
    cap(
      "Practice Workflow",
      "Keep verification activity closer to daily operations",
    ),
  ],
  connected: "Operational Efficiency + Smart Forms + connected task workflows",
  bestFit:
    "Practices where manual insurance verification creates delays, backlogs, and repeated staff effort.",
  changes: [
    "Less manual verification work",
    "Earlier information capture",
    "Clearer exception ownership",
  ],
});
