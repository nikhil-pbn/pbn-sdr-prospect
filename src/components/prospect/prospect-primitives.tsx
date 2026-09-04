/**
 * Shared building blocks for the prospect page. Server components — nothing
 * here needs state, and the public page should ship as little JS as possible.
 */

/** A heading where one phrase is lifted into the accent colour, as in the template. */
export function AccentHeading({
  text,
  accent,
  accentClassName = "text-(--prospect-purple)",
}: {
  text: string;
  accent?: string | null;
  accentClassName?: string;
}) {
  if (!accent || !text.includes(accent)) return <>{text}</>;

  const [before, ...rest] = text.split(accent);
  return (
    <>
      {before}
      <em className={`not-italic ${accentClassName}`}>{accent}</em>
      {rest.join(accent)}
    </>
  );
}

/**
 * Pill button. A plain anchor rather than `next/link`: every href here leaves the
 * site (a calendar page or a mailto), and it opens in a new tab so the prospect
 * keeps the page they were reading.
 *
 * `data-analytics-click` carries the button's own text, so Step 5's click
 * tracking can report "Top clicked actions" as the prospect saw them.
 */
export function ProspectButton({
  href,
  label,
  variant = "navy",
}: {
  href: string;
  label: string;
  variant?: "navy" | "white";
}) {
  const styles =
    variant === "navy"
      ? "bg-(--prospect-navy-deep) text-(--prospect-on-dark) hover:bg-(--prospect-navy)"
      : "bg-white text-(--prospect-navy-deep) hover:bg-(--prospect-band)";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-analytics-click={label}
      className={`inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-bold whitespace-nowrap no-underline transition-colors ${styles}`}
    >
      {label}
    </a>
  );
}

/** The template's column: centred, about 1000px wide. */
export function ProspectContainer({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-5xl ${className}`}>{children}</div>
  );
}

/** Pastel tile backgrounds, keyed by the names the content files use. */
export const TILE_TONES = {
  yellow: "bg-(--prospect-tile-yellow)",
  lavender: "bg-(--prospect-tile-lavender)",
  green: "bg-(--prospect-tile-green)",
  blue: "bg-(--prospect-tile-blue)",
} as const;

export type TileTone = keyof typeof TILE_TONES;

/** A big figure and a caption on a pastel tile — used in the hero and the mosaic. */
export function StatTile({
  value,
  label,
  tone,
  className = "",
}: {
  value: string;
  label: string;
  tone: TileTone;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl p-5 ${TILE_TONES[tone]} ${className}`}>
      <p className="text-3xl font-extrabold tracking-tight text-(--prospect-navy) sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm leading-snug text-(--prospect-text-muted)">
        {label}
      </p>
    </div>
  );
}
