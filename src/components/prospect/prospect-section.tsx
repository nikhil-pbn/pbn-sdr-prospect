import { SectionIcon } from "@/icons/section-icons";
import type { SectionBlock, SectionContent } from "@/types/section-content";
import { TILE_TONES, type TileTone } from "./prospect-primitives";

/** Tiles take the pastels in this order, as in the template. */
const TILE_ORDER: TileTone[] = ["lavender", "green", "yellow", "blue"];

/** Header colours. Cards alternate: the first is navy, the second purple, and so on. */
const HEADER_TONES = {
  purple: "bg-(--prospect-header-purple)",
  navy: "bg-(--prospect-header-navy)",
} as const;

export type SectionTone = keyof typeof HEADER_TONES;

function Heading({ children }: { children: string }) {
  if (!children) return null;
  return (
    <h3 className="text-lg font-medium text-(--prospect-purple) sm:text-xl">
      {children}
    </h3>
  );
}

/** One block of the body, drawn by its kind. Every kind is a heading plus one thing. */
function Block({ block }: { block: SectionBlock }) {
  switch (block.type) {
    case "text":
      return (
        <div className="space-y-2.5">
          <Heading>{block.heading}</Heading>
          <p className="text-[15px] leading-relaxed text-(--prospect-text)">
            {block.text}
          </p>
        </div>
      );

    case "inline":
      return (
        <div className="space-y-2.5">
          <Heading>{block.heading}</Heading>
          <p className="text-[15px] leading-relaxed text-(--prospect-text)">
            {/* The lead is the answer — "PRM + Revenue IQ" — and the items after
                it are the standard reassurances, so only the lead is bold. */}
            {block.lead && (
              <strong className="font-semibold text-(--prospect-navy)">
                {block.lead}
              </strong>
            )}
            {block.items.map((item, index) => (
              <span key={`${index}-${item}`}>
                {(index > 0 || block.lead) && (
                  <span
                    aria-hidden
                    className="mx-2 text-(--prospect-text-faint)"
                  >
                    {block.separator}
                  </span>
                )}
                {item}
              </span>
            ))}
          </p>
        </div>
      );

    case "tiles":
      return (
        <div className="space-y-2.5">
          <Heading>{block.heading}</Heading>
          <ol className="grid gap-4 md:grid-cols-3 md:gap-5">
            {block.items.map((tile, index) => (
              <li
                key={tile.label}
                className={`rounded-xl px-5 py-5 sm:px-6 sm:py-7 ${TILE_TONES[TILE_ORDER[index % TILE_ORDER.length]]}`}
              >
                <p className="text-base font-semibold tracking-wide text-(--prospect-navy) uppercase">
                  {tile.label}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-(--prospect-text-muted)">
                  {tile.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      );

    case "grid": {
      // An odd count leaves a hole; the template fills it by letting the last
      // cell span the row.
      const odd = block.items.length % 2 === 1;
      return (
        <div className="space-y-2.5">
          <Heading>{block.heading}</Heading>
          {/* Container draws the top and left edges, each cell its bottom and
              right, so the grid closes cleanly for any count. */}
          <ul className="grid overflow-hidden rounded-lg border-t border-l border-(--prospect-border) sm:grid-cols-2">
            {block.items.map((item, index) => (
              <li
                key={`${index}-${item.name}`}
                className={`border-r border-b border-(--prospect-border) bg-[#eeedfb] px-4 py-4 text-[15px] leading-snug sm:px-7 sm:py-5 ${odd && index === block.items.length - 1 ? "sm:col-span-2" : ""}`}
              >
                <span className="font-semibold text-(--prospect-navy)">
                  {item.name}
                  {item.description && ":"}
                </span>
                {item.description && (
                  <span className="text-(--prospect-text)">
                    {" "}
                    {item.description}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "bullets":
      return (
        <div className="space-y-2.5">
          <Heading>{block.heading}</Heading>
          {/* Short items flow on one line; full sentences stack one per line,
              as the pain-point cards' "When this problem shows up" does. */}
          <ul
            className={`text-[15px] leading-relaxed text-(--prospect-text) ${block.stacked ? "space-y-1.5" : "flex flex-wrap gap-x-4 gap-y-1"}`}
          >
            {block.items.map((item) => (
              <li key={item} className={block.stacked ? "flex gap-2.5" : ""}>
                <span aria-hidden className={block.stacked ? "" : "mr-1.5"}>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
  }
}

/**
 * One predefined section — a category or a pain point — as the template's card:
 * a coloured header (navy, then purple, alternating down the page), then the
 * section's blocks in the order the content lists them.
 */
export function ProspectSection({
  slug,
  content,
  tone = "navy",
}: {
  /** The selectable's slug — picks the header icon. */
  slug: string;
  content: SectionContent;
  tone?: SectionTone;
}) {
  const hasBody = content.blocks.length > 0;

  return (
    <article className="overflow-hidden rounded-(--card-radius) bg-(--prospect-card) shadow-[0_24px_60px_-28px_rgba(16,29,77,0.45)] [--card-radius:28px] sm:[--card-radius:44px] lg:[--card-radius:75px]">
      {/* The header runs on under the body, which is pulled up over it with its
          own rounded top — so the header colour shows in the body's corners,
          as in the template. Extra bottom padding is the room it needs. */}
      <header
        className={`flex items-center px-5 pt-6 text-(--prospect-on-dark) sm:px-10 lg:px-14 ${hasBody ? "pb-[calc(var(--card-radius)_+_1.25rem)]" : "pb-6"} ${HEADER_TONES[tone]}`}
      >
        <div className="flex items-center gap-6">
          <SectionIcon
            slug={slug}
            className="hidden size-16 shrink-0 sm:block"
            aria-hidden
          />
          <div>
            {content.eyebrow && (
              <p className="text-xs font-medium tracking-[0.08em] uppercase">
                {content.eyebrow}
              </p>
            )}
            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-3xl">
              {content.title}
            </h2>
            {content.subtitle && (
              <p className="mt-1.5 text-sm leading-relaxed text-(--prospect-on-dark-muted) sm:text-[15px]">
                {content.subtitle}
              </p>
            )}
          </div>
        </div>
      </header>

      {hasBody && (
        <div className="-mt-(--card-radius) space-y-7 rounded-t-(--card-radius) bg-(--prospect-card) px-5 py-6 sm:space-y-8 sm:px-10 sm:py-8 lg:px-14">
          {content.blocks.map((block, index) => (
            <Block key={`${block.type}-${index}`} block={block} />
          ))}
        </div>
      )}
    </article>
  );
}
