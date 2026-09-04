export type Sdr = {
  /** Lowercase: the key everything matches on. */
  email: string;
  name: string;
  /** Null for an SDR with no booking page; their buttons fall back to a mailto. */
  calendarUrl: string | null;
};

export const SDR_TEAM: readonly Sdr[] = [
  {
    email: "nikhil.kumar@practicenumbers.com",
    name: "Nikhil Kumar",
    calendarUrl: "https://calendly.com/nikhil-kumar-p",
  },
  // ROSTER PENDING: the other SDRs' names and calendar links have not been
  // supplied yet. Add them here as above.
];

export function sdrByEmail(email: string): Sdr | null {
  const wanted = email.trim().toLowerCase();
  return SDR_TEAM.find((sdr) => sdr.email === wanted) ?? null;
}

/**
 * Where a prospect's booking buttons should point for this SDR.
 *
 * Unknown SDRs fall back to emailing them rather than to a guessed URL. A mailto
 * built from the address they signed in with always works; a guessed booking URL
 * 404s silently, and nobody finds out until a deal goes quiet.
 */
export function sdrCalendarHref(email: string): string {
  return (
    sdrByEmail(email)?.calendarUrl ?? `mailto:${email.trim().toLowerCase()}`
  );
}
