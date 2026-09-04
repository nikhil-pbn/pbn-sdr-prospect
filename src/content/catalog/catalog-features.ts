/**
 * Real feature names per category — the PbN catalog (practicenumbers.com, via
 * the PbN Proposals project) and, for the AI Receptionist, PbN's own site (which
 * also gives its headings: "Never miss a new patient because nobody picked up." /
 * "Every unanswered call is a new patient calling someone else."). Not seeded
 * while the stand-in body is in use; the raw material for the real copy.
 */
export const CATALOG_FEATURES: Record<string, string[]> = {
  "all-in-one-dental-software": [
    "Business Analytics",
    "Patient Relationship Management",
    "Operational Efficiency",
    "PbN AI",
    "PbN Voice",
    "Dental Marketing",
    "PbN Payments",
    "Smart Forms",
  ],
  "patient-relationship-management": [
    "Patient Reminders",
    "Two-Way Texting",
    "Patient Follow-Ups",
    "Online Appointment Booking",
    "Patient Portal",
    "Review Management",
    "Campaign Suite",
  ],
  "operational-efficiency": [
    "Workflow automation",
    "Task management",
    "Insurance verification",
  ],
  "pbn-ai": [
    "Call Transcription",
    "Call Summaries",
    "Sentiment Analysis",
    "Form Summary",
    "Insurance Summary",
    "Content Writer",
    "AI Insights",
    "Revenue Finder",
  ],
  "pbn-voice": [
    "Cloud-based VoIP phone system",
    "PMS-integrated caller context",
    "Office phone analytics",
    "24/7 call answering",
  ],
  "dental-marketing": [
    "Campaign management",
    "Marketing ROI tracking",
    "Marketing IQ",
  ],
  "pbn-payments": [
    "Card processing",
    "Payment plans",
    "Transparent processing rates",
  ],
  "smart-forms": [
    "Digital patient forms",
    "Kiosk check-in",
    "Forms synced to the practice management system",
  ],
  "pbn-ai-receptionist": [
    "New Patient Appointment Booking",
    "Returning Patient Appointment Booking",
    "Appointment Confirmation",
    "Cancellation — Patient Keeps the Appointment",
    "Account Balance Check",
    "Practice Address & Office Hours",
    "Full call recordings & transcripts",
    "HIPAA-compliant, every call",
  ],
};
