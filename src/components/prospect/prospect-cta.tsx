import type { ProspectCta } from "@/types/prospect-page";
import { ProspectButton, ProspectContainer } from "./prospect-primitives";

/**
 * The closing band — the one block an SDR can edit. Title and description on
 * the left, the booking button on the right, on navy as in the template.
 */
export function ProspectCtaBand({ cta }: { cta: ProspectCta }) {
  return (
    <section id="next-steps" className="scroll-mt-20 px-6 pt-2 pb-14 sm:pb-16">
      <ProspectContainer className="flex max-md:flex-col max-sm:text-center items-center justify-between gap-6 rounded-2xl bg-(--prospect-navy-deep) px-6 py-6 text-(--prospect-on-dark) sm:px-9 sm:py-7">
        <div className="md:max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {cta.title}
          </h2>
          {cta.description && (
            <p className="mt-1.5 text-sm max-sm:mx-1 leading-relaxed text-(--prospect-on-dark-muted) sm:text-base">
              {cta.description}
            </p>
          )}
        </div>
        <ProspectButton href={cta.url} label={cta.buttonText} variant="white" />
      </ProspectContainer>
    </section>
  );
}
