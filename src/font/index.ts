import localFont from "next/font/local";

/**
 * The prospect page's typefaces, self-hosted — the same files the PbN Voice site
 * ships, so the two read as one brand. Google Sans Flex carries all text on the
 * page; Lora is the italic serif of the testimonial quotes. The internal tool
 * keeps Geist.
 *
 * Only the three weights each page uses are bundled; `next/font` subsets and
 * preloads them and exposes each family as a CSS variable on <html>.
 */
export const googleSansFlex = localFont({
  src: [
    {
      path: "./GoogleSansFlex/GoogleSansFlex_24pt-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./GoogleSansFlex/GoogleSansFlex_24pt-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./GoogleSansFlex/GoogleSansFlex_24pt-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-google-sans-flex",
  display: "swap",
});

export const lora = localFont({
  src: [
    { path: "./Lora/Lora-Regular.woff2", weight: "400", style: "normal" },
    { path: "./Lora/Lora-Bold.woff2", weight: "700", style: "normal" },
    { path: "./Lora/Lora-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-lora",
  display: "swap",
});
