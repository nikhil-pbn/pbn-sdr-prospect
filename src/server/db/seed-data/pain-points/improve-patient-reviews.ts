import { cap, problemCard, tile } from "./card";

/**
 * Improve Patient Reviews — pain point, sortOrder 10.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-04. FLAGGED: the third "shows up" bullet on the card reads
 * "Payment activity is fragmented across systems and difficult to reconcile.",
 * which is the payments card's line; transcribed as supplied, pending the
 * business's correction. Edit here, then `npm run db:seed`.
 */
export const IMPROVE_PATIENT_REVIEWS = problemCard({
  slug: "improve-patient-reviews",
  name: "Improve Patient Reviews",
  sortOrder: 10,
  title: "Turn More Positive Patient Experiences Into Visible Reviews",
  subtitle:
    "Create a consistent review-request workflow and give the practice clearer visibility into reputation activity.",
  showsUp: [
    "Review requests depend on staff remembering to ask.",
    "Happy patients are not consistently directed to leave feedback.",
    "Payment activity is fragmented across systems and difficult to reconcile.",
  ],
  change: [
    tile("Ask", "Create a more consistent review-request process."),
    tile("Respond", "Make feedback activity easier to monitor and manage."),
    tile(
      "Learn",
      "Use reputation visibility to support patient experience improvement.",
    ),
  ],
  help: [
    cap(
      "Review Management",
      "Coordinate patient review requests and monitoring",
    ),
    cap("Automated Campaigns", "Trigger appropriate follow-up consistently"),
    cap(
      "Two-Way Communication",
      "Keep patient responses connected to the practice",
    ),
    cap("Marketing IQ", "Bring reputation activity into marketing visibility"),
    cap(
      "Multi-Location View",
      "Support more consistent oversight across locations",
    ),
    cap(
      "Patient Experience",
      "Connect feedback with broader communication workflows",
    ),
  ],
  connected: "Dental Marketing + PRM Review Management",
  bestFit:
    "Practices with inconsistent review generation, limited reputation visibility, or multi-location oversight needs.",
  changes: [
    "More consistent review requests",
    "Clearer reputation visibility",
    "Less dependence on staff memory",
  ],
});
