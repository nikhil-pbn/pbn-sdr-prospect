import { cap, problemCard, tile } from "./card";

/**
 * Reduce No-Shows — pain point, sortOrder 7.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-04. Edit here; the change ships with the next deploy.
 */
export const REDUCE_NO_SHOWS = problemCard({
  slug: "reduce-no-shows",
  name: "Reduce No-Shows",
  sortOrder: 7,
  title: "Keep More Confirmed Appointments on the Schedule",
  subtitle:
    "Use coordinated reminders, convenient responses, and configurable booking workflows to reduce avoidable appointment gaps.",
  showsUp: [
    "Patients forget appointments or confirm too late.",
    "Staff spend significant time calling for confirmations.",
    "Last-minute cancellations create schedule gaps that are difficult to refill.",
  ],
  change: [
    tile("Remind", "Send timely, consistent appointment communication."),
    tile("Respond", "Make confirmation and rescheduling more convenient."),
    tile(
      "Recover",
      "Create clearer workflows for gaps, follow-up, and rebooking.",
    ),
  ],
  help: [
    cap(
      "Patient Reminders",
      "Automate appointment reminder and confirmation workflows",
    ),
    cap("Two-Way Texting", "Let patients respond through a convenient channel"),
    cap(
      "Online Booking",
      "Give patients an accessible scheduling and rebooking path",
    ),
    cap(
      "Follow-Up Campaigns",
      "Coordinate outreach after missed or cancelled visits",
    ),
    cap(
      "PbN Payments",
      "Support deposits or payment steps where configured and appropriate",
    ),
    cap(
      "Schedule Visibility",
      "Help teams identify gaps and prioritize action",
    ),
  ],
  connected:
    "PRM + Online Booking, with Payments and analytics where appropriate",
  bestFit:
    "Practices with high confirmation workload, late cancellations, or recurring schedule gaps.",
  changes: [
    "Less manual confirmation work",
    "More convenient patient responses",
    "More consistent gap recovery",
  ],
});
