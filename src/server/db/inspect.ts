/**
 * Prints what's in the database, without Prisma Studio.
 *
 *   npm run db:check
 *
 * Useful to confirm the connection works before debugging anything else.
 */
import { prisma } from "./client";

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  const where = url.replace(/\/\/[^@]*@/, "//***:***@");
  console.log(`connection   ${where || "(DATABASE_URL not set)"}\n`);

  const categories = await prisma.category.count({ where: { active: true } });
  const painPoints = await prisma.painPoint.count({ where: { active: true } });
  const sections = await prisma.section.count();
  const prospects = await prisma.prospect.count();

  console.log(`categories   ${categories} active`);
  console.log(`pain points  ${painPoints} active`);
  console.log(`sections     ${sections}`);
  console.log(`prospects    ${prospects}\n`);

  if (categories + painPoints === 0) {
    console.log("Catalog is empty. Run `npm run db:seed`.");
  }

  const rows = await prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      slug: true,
      name: true,
      ownerEmail: true,
      mode: true,
      status: true,
      createdAt: true,
    },
  });

  for (const row of rows) {
    console.log(
      `${row.createdAt.toISOString().slice(0, 16)}  ${row.status.padEnd(9)} ${row.mode.padEnd(9)} ${row.ownerEmail.padEnd(40)} ${row.slug}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
