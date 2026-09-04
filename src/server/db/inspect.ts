/**
 * Prints what's in the database, without Prisma Studio.
 *
 *   npm run db:check
 *
 * Useful to confirm the connection works before debugging anything else. The
 * catalog is code, not tables, so its counts come from the module — printed
 * here anyway, because importing it is also what validates it.
 */
import { prisma } from "./client";
import { ProspectStatus } from "@/generated/prisma/enums";
import { CATALOG } from "@/content/catalog";

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  const where = url.replace(/\/\/[^@]*@/, "//***:***@");
  console.log(`connection   ${where || "(DATABASE_URL not set)"}\n`);

  console.log(
    `catalog      ${CATALOG.category.length} categories · ${CATALOG.pain_point.length} pain points (code: src/content/catalog)`,
  );

  const [prospects, published, tracking, visits] = await Promise.all([
    prisma.prospect.count(),
    prisma.prospect.count({ where: { status: ProspectStatus.Published } }),
    prisma.prospectTracking.count(),
    prisma.prospectAnalyticsEvent.count(),
  ]);
  console.log(`prospects    ${prospects} (${published} published)`);
  console.log(`tracking     ${tracking} log rows`);
  console.log(`visits       ${visits} analytics rows\n`);

  const rows = await prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      slug: true,
      ownerEmail: true,
      mode: true,
      selections: true,
      status: true,
      createdAt: true,
    },
  });

  for (const row of rows) {
    console.log(
      `${row.createdAt.toISOString().slice(0, 16)}  ${row.status.padEnd(9)} ${row.mode.padEnd(9)} ${String(row.selections.length).padStart(2)} picked  ${row.ownerEmail.padEnd(40)} ${row.slug}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
