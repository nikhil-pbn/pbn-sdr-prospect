/**
 * The testimonial mosaic — quotes, figures and photographs in one grid. Copied
 * from the PbN Voice site (pbn-voice/src/constants/home, `testimonialsSection`
 * and `CARD_PLACEMENT`), which is the template's source. Static in V1.
 *
 * Quotes carry `<highlight>…</highlight>` around the phrase the design marks in
 * yellow; the renderer turns that into a `<mark>`. The photographs live under
 * public/images/testimonials/, copied from the same site.
 */

export type TestimonialCard =
  | {
      id: number;
      type: "testimonial";
      background: string;
      quote: string;
      author: string;
      company: string;
    }
  | { id: number; type: "image"; src: string; alt: string }
  | {
      id: number;
      type: "metric";
      background: string;
      value: string;
      description: string;
    };

export const TESTIMONIALS = {
  title: "Proven at the Front Desk, Visible in the Numbers.",
  cards: [
    {
      id: 1,
      type: "testimonial",
      background: "#FFF7E7",
      quote:
        "We used to type every call into the phone system, then again into the chart. Now it just lands there. <highlight>My team stopped rebuilding the story</highlight> from four open tabs.",
      author: "Danielle Brooks",
      company: "Office Manager, Cedar Ridge Dental",
    },
    {
      id: 2,
      type: "image",
      src: "/images/testimonials/Testimonial_01.webp",
      alt: "Office manager using computer",
    },
    {
      id: 3,
      type: "image",
      src: "/images/testimonials/Testimonial_02.webp",
      alt: "Dental hallway",
    },
    {
      id: 4,
      type: "metric",
      background: "#FDE7D7",
      value: "$19k",
      description: "in production traced to phone calls in a single month.",
    },
    {
      id: 5,
      type: "image",
      src: "/images/testimonials/Testimonial_03.webp",
      alt: "Dental operatory",
    },
    {
      id: 6,
      type: "testimonial",
      background: "#EAF8FF",
      quote:
        "I know who's calling before I say hello, so patients don't repeat themselves. And when we're closed, the <highlight>AI answers and texts back</highlight> the ones we miss.",
      author: "Sofia Martinez",
      company: "Patient Coordinator, Northgate Family Dental",
    },
    {
      id: 7,
      type: "metric",
      background: "#EFE5FF",
      value: "24/7",
      description: "coverage with AI answering and missed-call text-back.",
    },
    {
      id: 8,
      type: "metric",
      background: "#EAF8D8",
      value: "12 hrs/week",
      description: "saved at the front desk.",
    },
    {
      id: 9,
      type: "image",
      src: "/images/testimonials/Testimonial_04.webp",
      alt: "Dental office",
    },
    {
      id: 10,
      type: "testimonial",
      background: "#FFF7E7",
      quote:
        "Call AI showed me what we were leaving on the table. It flags missed new-patient calls and whether anyone followed up. Last month it traced <highlight>$19k in production</highlight> back to phone calls.",
      author: "Dr. James Okafor",
      company: "Dentist and Owner, Lakeview Dental Group",
    },
  ] satisfies readonly TestimonialCard[],
} as const;

/**
 * Where each card sits on wide screens, by index. Four columns, five rows; the
 * literal class strings stay literal so Tailwind can find them.
 */
export const CARD_PLACEMENT = [
  "lg:col-start-1 lg:col-span-3 lg:row-start-1", //  1  cream quote, spans cols 1-3
  "lg:col-start-4 lg:row-start-1", //  2  office manager at laptop
  "lg:col-start-1 lg:row-start-2 lg:row-span-2", //  3  hallway, tall
  "lg:col-start-2 lg:row-start-2", //  4  $19k metric
  "lg:col-start-3 lg:row-start-2", //  5  operatory, narrow
  "lg:col-start-4 lg:row-start-2 lg:row-span-2", //  6  blue quote, tall
  "lg:col-start-1 lg:row-start-4", //  7  24/7 metric
  "lg:col-start-2 lg:col-span-2 lg:row-start-3", //  8  hours-saved metric, spans the middle
  "lg:col-start-1 lg:row-start-5", //  9  dental office
  "lg:col-start-2 lg:col-span-3 lg:row-start-4 lg:row-span-2", // 10  cream quote, spans cols 2-4
] as const;
