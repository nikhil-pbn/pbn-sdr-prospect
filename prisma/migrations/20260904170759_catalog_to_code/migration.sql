-- The predefined catalog — categories, pain points and their sections — moves
-- out of the database into code (src/content/catalog). A prospect now records
-- what was ticked as catalog slugs on its own row, so the two join tables go
-- with the three content tables.

-- 1. Where the picks will live.
ALTER TABLE "prospects" ADD COLUMN "selections" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 2. Carry every existing pick across, in catalog order, before anything is dropped.
UPDATE "prospects" p
SET "selections" = COALESCE(
  (SELECT array_agg(c."slug" ORDER BY c."sort_order")
     FROM "prospect_categories" pc
     JOIN "categories" c ON c."id" = pc."category_id"
    WHERE pc."prospect_id" = p."id"),
  ARRAY[]::TEXT[])
WHERE p."mode" = 'Category';

UPDATE "prospects" p
SET "selections" = COALESCE(
  (SELECT array_agg(pp."slug" ORDER BY pp."sort_order")
     FROM "prospect_pain_points" ppp
     JOIN "pain_points" pp ON pp."id" = ppp."pain_point_id"
    WHERE ppp."prospect_id" = p."id"),
  ARRAY[]::TEXT[])
WHERE p."mode" = 'PainPoint';

-- 3. The tables, dependents first.
DROP TABLE "prospect_categories";
DROP TABLE "prospect_pain_points";
DROP TABLE "categories";
DROP TABLE "pain_points";
DROP TABLE "sections";
DROP TYPE "SectionType";
