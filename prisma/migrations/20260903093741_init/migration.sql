-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('Category', 'PainPoint');

-- CreateEnum
CREATE TYPE "SelectionMode" AS ENUM ('Category', 'PainPoint');

-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('Draft', 'Published');

-- CreateTable
CREATE TABLE "sections" (
    "id" UUID NOT NULL,
    "type" "SectionType" NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "content" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "section_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pain_points" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "section_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pain_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prospects" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "owner_email" VARCHAR(255) NOT NULL,
    "owner_name" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mode" "SelectionMode" NOT NULL,
    "status" "ProspectStatus" NOT NULL DEFAULT 'Draft',
    "cta_title" VARCHAR(255) NOT NULL,
    "cta_description" VARCHAR(1000) NOT NULL,
    "cta_button_text" VARCHAR(100) NOT NULL,
    "cta_url" VARCHAR(500) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prospect_categories" (
    "prospect_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "prospect_categories_pkey" PRIMARY KEY ("prospect_id","category_id")
);

-- CreateTable
CREATE TABLE "prospect_pain_points" (
    "prospect_id" UUID NOT NULL,
    "pain_point_id" UUID NOT NULL,

    CONSTRAINT "prospect_pain_points_pkey" PRIMARY KEY ("prospect_id","pain_point_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sections_key_key" ON "sections"("key");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_section_id_key" ON "categories"("section_id");

-- CreateIndex
CREATE INDEX "categories_active_sort_order_idx" ON "categories"("active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "pain_points_slug_key" ON "pain_points"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pain_points_section_id_key" ON "pain_points"("section_id");

-- CreateIndex
CREATE INDEX "pain_points_active_sort_order_idx" ON "pain_points"("active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "prospects_slug_key" ON "prospects"("slug");

-- CreateIndex
CREATE INDEX "prospects_owner_email_idx" ON "prospects"("owner_email");

-- CreateIndex
CREATE INDEX "prospects_status_created_at_idx" ON "prospects"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "prospect_categories_category_id_idx" ON "prospect_categories"("category_id");

-- CreateIndex
CREATE INDEX "prospect_pain_points_pain_point_id_idx" ON "prospect_pain_points"("pain_point_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pain_points" ADD CONSTRAINT "pain_points_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospect_categories" ADD CONSTRAINT "prospect_categories_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospect_categories" ADD CONSTRAINT "prospect_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospect_pain_points" ADD CONSTRAINT "prospect_pain_points_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospect_pain_points" ADD CONSTRAINT "prospect_pain_points_pain_point_id_fkey" FOREIGN KEY ("pain_point_id") REFERENCES "pain_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
