import type { SectionContent } from "./section-content";
import type { CtaInput } from "@/server/validation/cta-input";

/**
 * Everything the prospect page renders that VARIES per prospect. The fixed
 * parts — header, hero copy, testimonials, footer — are constants the renderer
 * reads directly (`content/static-sections.ts`), so they are not carried here.
 *
 * The same object feeds the public `/[slug]` page and the editor's preview. The
 * two differ only in where it comes from: the stored row there, and here, the
 * stored row with the CTA replaced by unsaved React state.
 */

export type ProspectCta = CtaInput;

export type ProspectPageSection = {
  /** The Section row's id — the React key, and a stable anchor. */
  id: string;
  /** The selectable's slug, for anchors and for tests. */
  slug: string;
  /** The selectable's name as the SDR picked it — "PbN Voice", not the card's title. */
  name: string;
  content: SectionContent;
};

export type ProspectPageContent = {
  /** Who the page is addressed to — appears in the hero eyebrow and the title. */
  prospectName: string;
  /** The dynamic middle, already in `sortOrder`. */
  sections: ProspectPageSection[];
  /** The one editable block. Its `url` is also where the hero button points. */
  cta: ProspectCta;
};
