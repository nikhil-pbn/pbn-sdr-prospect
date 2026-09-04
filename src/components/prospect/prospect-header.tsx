import { PbnLogo } from "@/components/brand/pbn-logo";
import { ProspectContainer } from "./prospect-primitives";

/**
 * Logo bar. Sits on the hero's lavender so the two read as one block, and
 * carries nothing else — the brief wants the prospect page focused on its
 * content, with no navigation to wander off into.
 *
 * A new tab, not this one: the reader is part-way through a page that was sent
 * to them, and a logo click must not be a way to lose it.
 */
export function ProspectHeader() {
  return (
    <header className="bg-(--prospect-hero) px-6">
      <ProspectContainer className="flex h-16 items-center">
        <a
          href="https://practicenumbers.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm outline-offset-4 transition-opacity hover:opacity-90 focus-visible:outline-2"
        >
          <PbnLogo size="md" eager />
        </a>
      </ProspectContainer>
    </header>
  );
}
