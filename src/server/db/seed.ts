/**
 * Seeds the predefined catalog: every Category and PainPoint, each with the
 * Section that answers it.
 *
 *   npm run db:seed
 *
 * Idempotent — upserts on the selectable's slug and the section's key — so it
 * can be re-run after editing the seed data to push corrected copy into an
 * existing database without touching any prospect. Rows the seed no longer
 * lists are left alone (deactivate them by hand rather than deleting: prospects
 * may reference them).
 *
 * Ends by listing every section still carrying the "[Copy pending]" marker, so
 * what remains to be written is impossible to miss.
 */
import { prisma } from "./client";
import { SectionType } from "@/generated/prisma/enums";
import { isCopyPending, sectionContentSchema } from "@/types/section-content";
import { CATEGORY_SEED } from "./seed-data/categories";
import { PAIN_POINT_SEED } from "./seed-data/pain-points";
import type { SeedEntry } from "./seed-data/shared";

async function upsertSection(
  kind: "category" | "pain_point",
  entry: SeedEntry,
) {
  // Validated here too — the schema is what the page trusts, and a seed that
  // wrote something the page then refuses would fail at the worst moment.
  const content = sectionContentSchema.parse(entry.content);
  const key = `${kind}:${entry.slug}`;
  const type =
    kind === "category" ? SectionType.Category : SectionType.PainPoint;

  return prisma.section.upsert({
    where: { key },
    update: { content, type, active: true },
    create: { key, content, type, active: true },
    select: { id: true },
  });
}

async function main() {
  const pendingKeys: string[] = [];

  for (const entry of CATEGORY_SEED) {
    const section = await upsertSection("category", entry);
    const data = {
      name: entry.name,
      sortOrder: entry.sortOrder,
      sectionId: section.id,
      active: true,
    };
    await prisma.category.upsert({
      where: { slug: entry.slug },
      update: data,
      create: { slug: entry.slug, ...data },
    });
    if (isCopyPending(entry.content))
      pendingKeys.push(`category:${entry.slug}`);
  }

  for (const entry of PAIN_POINT_SEED) {
    const section = await upsertSection("pain_point", entry);
    const data = {
      name: entry.name,
      sortOrder: entry.sortOrder,
      sectionId: section.id,
      active: true,
    };
    await prisma.painPoint.upsert({
      where: { slug: entry.slug },
      update: data,
      create: { slug: entry.slug, ...data },
    });
    if (isCopyPending(entry.content)) {
      pendingKeys.push(`pain_point:${entry.slug}`);
    }
  }

  console.log(`categories   ${CATEGORY_SEED.length} upserted`);
  console.log(`pain points  ${PAIN_POINT_SEED.length} upserted`);
  console.log(`sections     ${await prisma.section.count()} in database`);

  if (pendingKeys.length > 0) {
    console.log(
      `\n${pendingKeys.length} section(s) still carry "[Copy pending]":`,
    );
    for (const key of pendingKeys) console.log(`  - ${key}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
