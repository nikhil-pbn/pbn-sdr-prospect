import { cap, problemCard, tile } from "./card";

/**
 * Improve Recall and Reactivation — pain point, sortOrder 3.
 *
 * COPY STATUS: authored — transcribed from the template card supplied on
 * 2026-09-04. One typographic fix: the card read "Revenue IQ ," with a space
 * before the comma. Edit here, then `npm run db:seed`.
 */
export const IMPROVE_RECALL_AND_REACTIVATION = problemCard({
  slug: "improve-recall-and-reactivation",
  name: "Improve Recall and Reactivation",
  sortOrder: 3,
  title: "Bring More Patients Back Into the Schedule",
  subtitle:
    "Identify overdue and inactive patients, coordinate outreach, and give the team a more consistent follow-up process.",
  showsUp: [
    "Recall and reactivation lists are large but difficult to prioritize.",
    "Outreach happens inconsistently or stops after one attempt.",
    "The team cannot easily see which patients need the next action.",
  ],
  change: [
    tile("Find", "Identify the patients and opportunities needing attention"),
    tile("Reach", "Use coordinated text, email, and call follow-up."),
    tile(
      "Recover",
      "Create repeatable workflows that move patients back toward care.",
    ),
  ],
  help: [
    cap("Revenue IQ", "Surface actionable patient and revenue opportunities"),
    cap("Recall Campaigns", "Automate appropriate recall outreach"),
    cap("Reactivation Campaigns", "Reconnect with inactive patients"),
    cap("Two-Way Texting", "Make responses convenient for patients and staff"),
    cap("Advanced Campaigns", "Build targeted follow-up sequences"),
    cap("Task Management", "Assign and track the next patient action"),
  ],
  connected:
    "PRM + Revenue IQ, supported by task management and connected communications",
  bestFit:
    "Practices with overdue patients, inconsistent reactivation, or a large volume of follow-up opportunities.",
  changes: [
    "More consistent outreach",
    "Clearer follow-up priorities",
    "More patients returning to care",
  ],
});
