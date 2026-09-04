import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProspectTracker } from "@/components/analytics/prospect-tracker";
import { ProspectRenderer } from "@/components/prospect/prospect-renderer";
import { HERO } from "@/content/hero";
import { loadPublishedProspect } from "@/server/prospect/queries";
import { isProspectSlug } from "@/server/prospect/slug";

/** Reads the database and must reflect edits immediately after a save. */
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  if (!isProspectSlug(slug)) return {};

  const content = await loadPublishedProspect(slug);
  if (!content) return {};

  return {
    title: `Practice by Numbers for ${content.prospectName}`,
    description: HERO.subtitle,
  };
}

/**
 * The public prospect page. No sign-in, no session, no cookie — anyone with the
 * link can open it. The only thing standing between a visitor and a page is
 * whether it has been published.
 */
export default async function ProspectPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;

  /*
   * The prefix check comes first, and it is what makes a root-level catch-all
   * safe. Nothing else at the top level can ever be shadowed by a prospect, and
   * a scanner walking /wp-admin, /.env and friends gets a 404 without a database
   * query — every unmatched path on the whole domain lands here.
   */
  if (!isProspectSlug(slug)) notFound();

  // Deduped with generateMetadata's call by React `cache()`: one query per request.
  const content = await loadPublishedProspect(slug);

  // Draft, missing, or structurally invalid all render the same 404 — the
  // difference is internal and shouldn't leak to whoever has the link.
  if (!content) notFound();

  // The same renderer the editor previews with, so what an SDR approves is what
  // the prospect opens.
  return (
    <>
      <ProspectRenderer content={content} />
      {/*
       * Mounted here and NOT inside ProspectRenderer, which is also the editor's
       * live preview — a tracker in there would have every SDR inflating the
       * view count of the page they are editing. Last in the tree and rendering
       * nothing, so the page is already complete before any of this runs.
       */}
      <ProspectTracker slug={slug} />
    </>
  );
}
