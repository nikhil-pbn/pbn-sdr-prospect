import "server-only";
import { cache } from "react";
import { prisma } from "@/server/db";
import {
  sortOptions,
  type SelectionMode,
  type SelectionOption,
  type SelectionOptions,
} from "@/lib/prospect-options";

/**
 * The selectable catalog — active categories and pain points — as the form
 * needs them. Read once per request via React `cache()`.
 *
 * Inactive rows are hidden from NEW selections only. A prospect that already
 * references a since-deactivated category keeps rendering its section, so
 * deactivating something never blanks a page that was already sent.
 */
export const loadSelectionOptions = cache(
  async (): Promise<SelectionOptions> => {
    const [categories, painPoints] = await Promise.all([
      prisma.category.findMany({
        where: { active: true },
        select: { slug: true, name: true, sortOrder: true },
      }),
      prisma.painPoint.findMany({
        where: { active: true },
        select: { slug: true, name: true, sortOrder: true },
      }),
    ]);

    return {
      category: sortOptions(categories),
      pain_point: sortOptions(painPoints),
    };
  },
);

/** The rows behind a set of slugs for one mode, in `sortOrder`. Unknown slugs are simply absent. */
export async function findSelectables(
  mode: SelectionMode,
  slugs: readonly string[],
): Promise<Array<SelectionOption & { id: string }>> {
  const where = { slug: { in: [...slugs] }, active: true };
  const select = { id: true, slug: true, name: true, sortOrder: true };

  const rows =
    mode === "category"
      ? await prisma.category.findMany({ where, select })
      : await prisma.painPoint.findMany({ where, select });

  return sortOptions(rows);
}
