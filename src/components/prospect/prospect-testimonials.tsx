import Image from "next/image";
import {
  CARD_PLACEMENT,
  TESTIMONIALS,
  type TestimonialCard,
} from "@/content/testimonials";
import { ProspectContainer } from "./prospect-primitives";

/**
 * `<highlight>…</highlight>` in a quote marks the phrase the design paints
 * yellow, as on the PbN Voice site. Parsed into plain segments first — a pure
 * function, not a mutation inside render — then rendered.
 */
function segments(text: string): Array<{ text: string; highlighted: boolean }> {
  const out: Array<{ text: string; highlighted: boolean }> = [];
  let highlighted = false;
  for (const part of text.split(/(<highlight>|<[/]highlight>)/g)) {
    if (part === "<highlight>") {
      highlighted = true;
    } else if (part === "</highlight>") {
      highlighted = false;
    } else if (part) {
      out.push({ text: part, highlighted });
    }
  }
  return out;
}

function Quote({ text }: { text: string }) {
  return (
    <>
      {segments(text).map((segment, index) =>
        segment.highlighted ? (
          <mark
            key={index}
            className="bg-[#FFC807] box-decoration-clone px-0.5 text-inherit"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}

function Card({ card }: { card: TestimonialCard }) {
  if (card.type === "image") {
    return (
      <div className="relative h-full min-h-55 w-full overflow-hidden rounded-[10px] lg:min-h-0">
        {/* The widest photo column is about a third of the container; below lg
            the grid is a single column. Without `sizes` the browser fetches the
            largest candidate. */}
        <Image
          src={card.src}
          alt={card.alt}
          fill
          sizes="(min-width: 1024px) 360px, 92vw"
          className="object-cover transition duration-500 hover:scale-105"
        />
      </div>
    );
  }

  if (card.type === "metric") {
    return (
      <div
        className="flex h-full flex-col justify-evenly rounded-[10px] p-4 md:p-5"
        style={{ background: card.background }}
      >
        <p className="text-4xl leading-none font-semibold text-(--prospect-navy) xl:text-5xl">
          {card.value}
        </p>
        <p className="mt-1 text-sm text-(--prospect-text-muted) sm:text-base md:leading-7">
          {card.description}
        </p>
      </div>
    );
  }

  return (
    <figure
      className="flex h-full flex-col justify-between rounded-[10px] p-4 lg:p-6 xl:p-8"
      style={{ background: card.background }}
    >
      <blockquote className="font-quote text-lg leading-normal text-(--prospect-text) italic md:text-2xl">
        &ldquo;
        <Quote text={card.quote} />
        &rdquo;
      </blockquote>
      <figcaption className="mt-4">
        <p className="text-[18px] font-semibold text-(--prospect-navy)">
          {card.author}
        </p>
        <p className="mt-1 text-sm leading-6 text-(--prospect-text-muted)">
          {card.company}
        </p>
      </figcaption>
    </figure>
  );
}

/**
 * The mosaic: a four-column, five-row grid on wide screens with each card placed
 * explicitly (`CARD_PLACEMENT`), a single column below. Static content.
 */
export function ProspectTestimonials() {
  return (
    <section id="testimonials" className="scroll-mt-20 px-6 py-6 md:py-12">
      <ProspectContainer>
        {/* Two lines, broken after the comma as in the template; one line on phones. */}
        <h2 className="mb-6 text-center font-heading text-3xl leading-tight font-normal text-black sm:mb-10 sm:text-[40px] lg:text-5xl lg:leading-[1.15]">
          {TESTIMONIALS.title.split(/(?<=,) /).map((line, index) => (
            <span key={line} className={index > 0 ? "sm:block" : undefined}>
              {index > 0 && " "}
              {line}
            </span>
          ))}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-[2fr_1.1fr_0.8fr_2fr] lg:grid-rows-[minmax(250px,auto)_minmax(248px,auto)_minmax(156px,auto)_minmax(152px,auto)_minmax(150px,auto)]">
          {TESTIMONIALS.cards.map((card, index) => (
            <div key={card.id} className={CARD_PLACEMENT[index]}>
              <Card card={card} />
            </div>
          ))}
        </div>
      </ProspectContainer>
    </section>
  );
}
