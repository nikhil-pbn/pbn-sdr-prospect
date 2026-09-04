import { cap, problemCard, tile } from "./card";

/**
 * Increase New-Patient Bookings — pain point, sortOrder 4.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-04. Edit here, then `npm run db:seed`.
 */
export const INCREASE_NEW_PATIENT_BOOKINGS = problemCard({
  slug: "increase-new-patient-bookings",
  name: "Increase New-Patient Bookings",
  sortOrder: 4,
  title: "Make It Easier for New Patients to Find, Reach, and Book You",
  subtitle:
    "Connect marketing visibility, website conversion, calls, and online scheduling so more patient interest has a path to an appointment.",
  showsUp: [
    "Website visitors have limited ways to engage after hours.",
    "Calls or inquiries are missed during busy periods.",
    "The practice cannot connect marketing activity to booked patients.",
  ],
  change: [
    tile("Capture", "Give prospective patients more ways to connect"),
    tile("Convert", "Reduce friction between interest and an appointment."),
    tile(
      "Measure",
      "See which sources and conversations contribute to bookings.",
    ),
  ],
  help: [
    cap(
      "Online Booking",
      "Let patients schedule through configured real-time availability",
    ),
    cap("Web Chat", "Give website visitors an immediate engagement path"),
    cap(
      "PbN Voice",
      "Connect incoming calls with patient context and call visibility",
    ),
    cap(
      "AI Receptionist",
      "Extend coverage for defined patient call workflows",
    ),
    cap("Marketing IQ", "Improve source and marketing performance visibility"),
    cap(
      "Review Management",
      "Strengthen the reputation signals prospective patients see",
    ),
  ],
  connected:
    "Dental Marketing + Online Booking + PbN Voice, with AI Receptionist where coverage is a gap",
  bestFit:
    "Growth-focused practices losing prospective patients between website visits, calls, and scheduling.",
  changes: [
    "More conversion paths",
    "Fewer missed opportunities",
    "Clearer source visibility",
  ],
});
