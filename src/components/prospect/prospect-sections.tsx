import type { ProspectPageSection } from "@/types/prospect-page";
import { ProspectContainer } from "./prospect-primitives";
import { ProspectSection } from "./prospect-section";

/**
 * The dynamic middle of the page: the selected sections as plain cards, one
 * after another in `sortOrder`, headers alternating navy and purple.
 */
export function ProspectSections({
  sections,
}: {
  sections: ProspectPageSection[];
}) {
  if (sections.length === 0) return null;

  return (
    <div className="px-6 py-4">
      <ProspectContainer className="space-y-16">
        {sections.map((section, index) => (
          <section
            key={section.slug}
            id={section.slug}
            className="scroll-mt-20"
          >
            <ProspectSection
              slug={section.slug}
              content={section.content}
              tone={index % 2 === 0 ? "navy" : "purple"}
            />
          </section>
        ))}
      </ProspectContainer>
    </div>
  );
}
