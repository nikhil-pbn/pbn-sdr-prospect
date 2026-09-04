import { cap, problemCard, tile } from "./card";

/**
 * Consolidate Disconnected Tools — pain point, sortOrder 9.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-04. Edit here; the change ships with the next deploy.
 */
export const CONSOLIDATE_DISCONNECTED_TOOLS = problemCard({
  slug: "consolidate-disconnected-tools",
  name: "Consolidate Disconnected Tools",
  sortOrder: 9,
  title: "Reduce the Software Juggle Across Your Practice",
  subtitle:
    "Connect more of the patient and practice journey in one modular platform without forcing the practice to change everything at once.",
  showsUp: [
    "Staff switch between multiple tools to complete one workflow.",
    "Patient and performance information is fragmented.",
    "Overlapping vendors create extra cost, training, and accountability gaps.",
  ],
  change: [
    tile(
      "Connect",
      "Bring related patient and practice workflows closer together.",
    ),
    tile("Simplify", "Reduce handoffs, duplicate work, and vendor sprawl."),
    tile(
      "Expand",
      "Start with the highest-priority need and add capabilities deliberately.",
    ),
  ],
  help: [
    cap(
      "Business Analytics",
      "Connect practice performance and revenue visibility",
    ),
    cap("PRM", "Coordinate patient communication and follow-up"),
    cap("Operational Efficiency", "Standardize daily administrative workflows"),
    cap(
      "Dental Marketing",
      "Connect acquisition, conversion, and ROI visibility",
    ),
    cap(
      "Voice & AI",
      "Bring calls, context, intelligence, and automation together",
    ),
    cap("Payments", "Simplify patient payment and collection workflows"),
  ],
  connected:
    "The PbN all-in-one platform, scoped modularly around the practice's priorities",
  bestFit:
    "Practices managing overlapping point solutions, duplicate workflows, and fragmented patient or performance data.",
  changes: [
    "Fewer disconnected workflows",
    "More consistent team adoption",
    "A clearer technology roadmap",
  ],
});
