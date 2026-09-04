import type { ProspectPageContent } from "@/types/prospect-page";
import { ProspectCtaBand } from "./prospect-cta";
import { ProspectHeader } from "./prospect-header";
import { ProspectHero } from "./prospect-hero";
import { ProspectSections } from "./prospect-sections";
import { ProspectStats } from "./prospect-stats";
import { ProspectTestimonials } from "./prospect-testimonials";

/**
 *
 *   Header → Hero → [selected sections] → Testimonials → CTA
 *
 */
export function ProspectRenderer({
  content,
}: {
  content: ProspectPageContent;
}) {
  return (
    <div className="prospect-theme min-h-full">
      <ProspectHeader />
      <main>
        <ProspectHero ctaHref={content.cta.url} />
        <ProspectStats />
        <ProspectSections sections={content.sections} />
        <ProspectTestimonials />
        <ProspectCtaBand cta={content.cta} />
      </main>
    </div>
  );
}
