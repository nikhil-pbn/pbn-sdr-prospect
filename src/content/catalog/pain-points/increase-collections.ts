import { cap, problemCard, tile } from "./card";

/**
 * Increase Collections — pain point, sortOrder 5.
 *
 * COPY STATUS: authored — transcribed verbatim from the template card supplied
 * on 2026-09-04. Edit here; the change ships with the next deploy.
 */
export const INCREASE_COLLECTIONS = problemCard({
  slug: "increase-collections",
  name: "Increase Collections",
  sortOrder: 5,
  title: "Make Patient Payments Easier to Complete and Easier to Manage",
  subtitle:
    "Connect payment options, patient outreach, and collection visibility to reduce friction around outstanding balances.",
  showsUp: [
    "Balances require repeated manual calls and follow-up.",
    "Patients have limited or inconvenient ways to pay.",
    "Payment activity is fragmented across systems and difficult to reconcile.",
  ],
  change: [
    tile("Reach", "Create timely, coordinated balance communication"),
    tile("Pay", "Offer convenient in-office, remote, and flexible options."),
    tile("Track", "Improve visibility into payment and collection activity."),
  ],
  help: [
    cap("PbN Payments", "Connect dental-focused payment workflows"),
    cap("Anywhere Payments", "Support convenient remote payment collection"),
    cap("Payment Plans", "Offer structured affordability options"),
    cap("Patient Portal", "Give patients access to bills and payment activity"),
    cap("PRM Campaigns", "Coordinate appropriate balance outreach"),
    cap("Analytics", "Improve collection and practice performance visibility"),
  ],
  connected: "PbN Payments + PRM, supported by Business Analytics",
  bestFit:
    "Practices with manual balance follow-up, fragmented payment tools, or demand for more flexible payment options.",
  changes: [
    "Less payment friction",
    "More convenient payment paths",
    "More connected collection workflows",
  ],
});
