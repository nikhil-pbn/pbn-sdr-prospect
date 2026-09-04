import { cap, problemCard, tile } from "./card";

/**
 * Increase Case Acceptance — pain point, sortOrder 6.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-04. Edit here; the change ships with the next deploy.
 */
export const INCREASE_CASE_ACCEPTANCE = problemCard({
  slug: "increase-case-acceptance",
  name: "Increase Case Acceptance",
  sortOrder: 6,
  title: "Keep Treatment Opportunities From Going Cold",
  subtitle:
    "Give the team visibility into unscheduled treatment, consistent patient follow-up, and flexible paths to move care forward.",
  showsUp: [
    "Patients leave without scheduling recommended treatment.",
    "Follow-up depends on staff memory or inconsistent lists.",
    "Affordability questions delay or stop treatment decisions.",
  ],
  change: [
    tile("Identify", "See unscheduled treatment and acceptance opportunities"),
    tile("Follow up", "Create consistent, personalized next steps."),
    tile(
      "Enable",
      "Give patients clearer communication and payment flexibility.",
    ),
  ],
  help: [
    cap(
      "Revenue IQ",
      "Surface treatment and revenue opportunities needing action",
    ),
    cap("Recall Campaigns", "Automate appropriate recall outreach"),
    cap(
      "Treatment Follow-Up",
      "Coordinate patient outreach after presentation",
    ),
    cap("Two-Way Texting", "Make questions and next steps easier to manage"),
    cap("Payment Plans", "Support structured affordability options"),
    cap("Advanced Tasks", "Assign ownership and track follow-through"),
  ],
  connected: "Business Analytics + PRM + PbN Payments",
  bestFit:
    "Practices with meaningful unscheduled treatment, inconsistent follow-up, or affordability-related delays.",
  changes: [
    "Clearer opportunity visibility",
    "More consistent follow-up",
    "Fewer treatments going cold",
  ],
});
