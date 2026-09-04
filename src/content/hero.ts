/**
 * The fixed top of every prospect page: hero and the stats bar. Static — not
 * editable in V1 — so it lives in code.
 *
 * Headline, subtitle, the four stats and the showcase tiles are the PbN Voice
 * site's own (pbn-voice/src/constants/home and components/home/HeroShowcase),
 * which is the template's source. The media files were copied from that site
 * into public/images/hero/.
 */

export const HERO = {
  headline: "The Smarter, AI-powered Phone System for Dental Practices",
  /** The second line, lifted into the accent colour as in the prospect mock. */
  headlineAccent: "Phone System for Dental Practices",
  subtitle:
    "PbN Voice helps dental practices answer more calls, capture every conversation, and connect phone activity to practice performance, all in one AI-powered system.",
  /** The hero button. Its href is the SDR's calendar (via the prospect's CTA link). */
  ctaLabel: "Book a Demo",
} as const;

/** The collage under the headline: three product animations, one photo, two figures. */
export const SHOWCASE = {
  call: {
    src: "/images/hero/IncomingCallGif.gif",
    alt: "An incoming call from Olivia Bennett, with answer and hang-up controls",
  },
  frontDesk: {
    src: "/images/hero/HeroGirl.png",
    alt: "Front desk coordinator taking a patient call",
  },
  deskPhone: {
    src: "/images/hero/PhoneGif.gif",
    alt: "PbN Voice desk phone",
  },
  transcription: {
    src: "/images/hero/TranscriptionVoiceGif.gif",
    alt: "A voicemail from Practice by Numbers, transcribed as it plays",
  },
  coverage: {
    value: "24/7",
    label: "coverage with AI answering and missed-call text-back",
  },
  production: {
    value: "$61k",
    label: "production traced back to phone calls in an example month",
  },
} as const;

/** The navy bar under the hero. */
export const STATS = [
  { value: "5,000+", label: "Dental Practices" },
  { value: "10M+", label: "Calls Handled" },
  { value: "62%", label: "Missed Calls Recovered" },
  { value: "4.9", label: "Average Customer Rating" },
] as const;
