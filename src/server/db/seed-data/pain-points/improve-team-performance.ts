import { cap, problemCard, tile } from "./card";

/**
 * Improve Team Performance — pain point, sortOrder 2.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-04. Edit here, then `npm run db:seed`.
 */
export const IMPROVE_TEAM_PERFORMANCE = problemCard({
  slug: "improve-team-performance",
  name: "Improve Team Performance",
  sortOrder: 2,
  title: "Turn Team Performance Into Something You Can See and Improve",
  subtitle:
    "Give leaders clearer performance visibility, shared goals, and workflows that help the team act on what needs attention.",
  showsUp: [
    "Performance conversations rely on incomplete or delayed reports",
    "Goals are not consistently connected to daily work.",
    "Leaders struggle to compare providers, teams, or locations fairly.",
  ],
  change: [
    tile(
      "See",
      "Create consistent visibility into the right performance indicators.",
    ),
    tile("Align", "Connect goals and daily priorities across the team."),
    tile(
      "Improve",
      "Use insight, coaching, and task ownership to drive action.",
    ),
  ],
  help: [
    cap("Practice IQ", "Monitor practice, provider, and team performance"),
    cap("Goals & KPIs", "Create measurable targets and shared accountability"),
    cap(
      "Daily Huddle",
      "Bring schedule and performance priorities into the day",
    ),
    cap("Advanced Tasks", "Assign follow-up and monitor completion"),
    cap("Call AI", "Support coaching with visibility into patient calls"),
    cap(
      "Enterprise Dashboard",
      "Compare performance across multiple locations",
    ),
  ],
  connected:
    "Business Analytics + Operational Efficiency, with Call AI where call coaching matters",
  bestFit:
    "Owners and managers who want more objective visibility, accountability, and consistency across the team.",
  changes: [
    "More focused coaching",
    "Clearer accountability",
    "More consistent execution",
  ],
});
