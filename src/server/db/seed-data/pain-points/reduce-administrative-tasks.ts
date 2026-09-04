import { cap, problemCard, tile } from "./card";

/**
 * Reduce Administrative Tasks — pain point, sortOrder 1.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-04. Edit here, then `npm run db:seed`.
 */
export const REDUCE_ADMINISTRATIVE_TASKS = problemCard({
  slug: "reduce-administrative-tasks",
  name: "Reduce Administrative Tasks",
  sortOrder: 1,
  title: "Give Your Team More Time for Patients and Less Manual Work",
  subtitle:
    "Extend front-desk coverage across voice and text while keeping your team in control of scheduling, answers, escalations, and performance visibility.",
  showsUp: [
    "Staff repeatedly enter, verify, or chase the same information.",
    "Daily work depends on manual checklists and individual memory.",
    "Busy periods create backlogs, missed tasks, and inconsistent follow-through.",
  ],
  change: [
    tile("Capacity", "Free staff from repetitive administrative work."),
    tile("Consistency", "Create repeatable workflows with clearer ownership."),
    tile("Focus", "Redirect time toward patients and higher-value activity."),
  ],
  help: [
    cap(
      "Insurance Verification",
      "Reduce manual eligibility and benefits work",
    ),
    cap("Smart Forms & Kiosk", "Digitize intake and patient data collection"),
    cap(
      "Advanced Task Management",
      "Assign, monitor, and complete operational work",
    ),
    cap("Daily Huddle", "Align the team around schedule and priorities"),
    cap(
      "Online Booking",
      "Reduce manual scheduling steps for configured visits",
    ),
    cap("PbN AI", "Automate selected calls and administrative workflows"),
  ],
  connected:
    "Operational Efficiency + PbN AI, supported by PRM and Online Booking",
  bestFit:
    "Practices where front-desk capacity is constrained by repetitive, manual, or paper-heavy work.",
  changes: [
    "Less repetitive admin",
    "Clearer task ownership",
    "More time for patient needs",
  ],
});
