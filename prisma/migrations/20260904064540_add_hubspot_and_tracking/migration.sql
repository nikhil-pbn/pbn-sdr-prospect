-- CreateEnum
CREATE TYPE "HubspotSyncStatus" AS ENUM ('NotAdded', 'Added', 'Failed');

-- AlterTable
ALTER TABLE "prospects" ADD COLUMN     "hubspot_contact_id" VARCHAR(64),
ADD COLUMN     "hubspot_error" VARCHAR(500),
ADD COLUMN     "hubspot_status" "HubspotSyncStatus" NOT NULL DEFAULT 'NotAdded',
ADD COLUMN     "hubspot_synced_at" TIMESTAMPTZ(3),
ADD COLUMN     "tracking_confirmed_at" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "prospect_tracking" (
    "id" UUID NOT NULL,
    "sdr_name" VARCHAR(255) NOT NULL,
    "prospect_name" VARCHAR(255) NOT NULL,
    "prospect_email" VARCHAR(255) NOT NULL,
    "prospect_url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prospect_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prospect_tracking_created_at_idx" ON "prospect_tracking"("created_at" DESC);

-- CreateIndex
CREATE INDEX "prospect_tracking_sdr_name_idx" ON "prospect_tracking"("sdr_name");
