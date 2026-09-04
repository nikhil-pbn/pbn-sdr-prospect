import Image from "next/image";
import { HERO, SHOWCASE } from "@/content/hero";
import { cn } from "@/lib/utils";
import {
  AccentHeading,
  ProspectButton,
  ProspectContainer,
} from "./prospect-primitives";

const TILE = "@container overflow-hidden rounded-[10px]";

/**
 * Media that fills its tile. The GIFs are served as-is — the image optimizer
 * would flatten an animation to its first frame.
 */
function TileMedia({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority
      unoptimized={src.endsWith(".gif")}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}

/** Shared scale for the small print inside a one-column tile. */
const TILE_CAPTION =
  "text-[clamp(9px,8cqw,16px)] leading-[1.35] text-(--prospect-text-muted)";
const TILE_FIGURE =
  "text-[clamp(24px,22cqw,42px)] leading-none font-semibold text-(--prospect-navy)";

/**
 * The PbN Voice showcase grid. Every tile is sized in `cqw`, so widening the
 * container scales the whole grid in proportion — the wide tile grows with it,
 * which is what keeps the transcription legible.
 */
function Showcase() {
  return (
    <div className="@container mx-auto w-full max-w-[57.6rem] text-left max-sm:max-w-[28.8rem]">
      <div className="grid auto-rows-[44cqw] grid-cols-2 gap-2 sm:auto-rows-[21cqw] sm:grid-cols-4">
        {/* Live call — the art carries its own navy plate. */}
        <div
          className={cn(TILE, "relative col-start-1 row-start-1 bg-[#22335E]")}
        >
          <TileMedia
            src={SHOWCASE.call.src}
            alt={SHOWCASE.call.alt}
            sizes="(min-width: 672px) 170px, (min-width: 640px) 25vw, 50vw"
          />
        </div>

        {/* Round-the-clock cover */}
        <div className={cn(TILE, "col-start-1 row-start-2 bg-[#F9EDFF]")}>
          <div className="flex h-full flex-col justify-center p-[8cqw]">
            <p className={TILE_FIGURE}>{SHOWCASE.coverage.value}</p>
            <p className={cn("mt-[5cqw]", TILE_CAPTION)}>
              {SHOWCASE.coverage.label}
            </p>
          </div>
        </div>

        {/* Front-desk photo, orange plate and all — a portrait tile, so it fills edge to edge. */}
        <div
          className={cn(
            TILE,
            "relative col-start-2 row-span-2 row-start-1 bg-[#F79A1C]",
          )}
        >
          <TileMedia
            src={SHOWCASE.frontDesk.src}
            alt={SHOWCASE.frontDesk.alt}
            sizes="(min-width: 672px) 170px, (min-width: 640px) 25vw, 50vw"
            className="scale-105 object-bottom"
          />
        </div>

        <div
          className={cn(
            TILE,
            "col-start-1 row-start-3 bg-[#FBE5D4] sm:col-start-3 sm:row-start-1",
          )}
        >
          <div className="flex h-full flex-col justify-center p-[7cqw]">
            <p className={TILE_FIGURE}>{SHOWCASE.production.value}</p>
            <p className={cn("mt-[5cqw]", TILE_CAPTION)}>
              {SHOWCASE.production.label}
            </p>
          </div>
        </div>

        {/* Desk phone */}
        <div
          className={cn(
            TILE,
            "relative col-start-2 row-start-3 bg-[#8BCD69] sm:col-start-4 sm:row-start-1",
          )}
        >
          <TileMedia
            src={SHOWCASE.deskPhone.src}
            alt={SHOWCASE.deskPhone.alt}
            sizes="(min-width: 672px) 170px, (min-width: 640px) 25vw, 50vw"
          />
        </div>

        {/* Voicemail with transcription */}
        <div
          className={cn(
            TILE,
            "relative col-span-2 col-start-1 row-start-4 bg-[#CFE7F7] sm:col-start-3 sm:row-start-2",
          )}
        >
          <TileMedia
            src={SHOWCASE.transcription.src}
            alt={SHOWCASE.transcription.alt}
            sizes="(min-width: 672px) 350px, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The hero: headline, subtitle, the showcase, and the one button — which books
 * into the SDR's calendar. `ctaHref` follows the prospect's CTA link so the page
 * has a single destination even after the SDR edits it.
 */
export function ProspectHero({ ctaHref }: { ctaHref: string }) {
  return (
    <section className="bg-(--prospect-hero) px-6 py-6 md:py-12">
      <ProspectContainer className="flex flex-col items-center text-center">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance text-(--prospect-navy) md:text-5xl md:leading-[1.15]">
          <AccentHeading text={HERO.headline} accent={HERO.headlineAccent} />
        </h1>
        <p className="mt-4 max-w-[42rem] text-sm font-light text-(--prospect-navy) sm:text-lg sm:leading-relaxed">
          {HERO.subtitle}
        </p>

        <div className="w-full py-5 sm:py-9">
          <Showcase />
        </div>

        <ProspectButton href={ctaHref} label={HERO.ctaLabel} />
      </ProspectContainer>
    </section>
  );
}
