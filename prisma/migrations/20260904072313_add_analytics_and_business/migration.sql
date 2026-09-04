-- AlterTable
ALTER TABLE "prospects" ADD COLUMN     "business_name" VARCHAR(255),
ADD COLUMN     "last_viewed_at" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "prospect_analytics_events" (
    "id" UUID NOT NULL,
    "prospect_id" UUID NOT NULL,
    "visitor_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "active_ms" INTEGER NOT NULL DEFAULT 0,
    "actions" JSONB,
    "last_beat_seq" INTEGER NOT NULL DEFAULT 0,
    "closed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prospect_analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prospect_analytics_events_prospect_id_created_at_idx" ON "prospect_analytics_events"("prospect_id", "created_at");

-- CreateIndex
CREATE INDEX "prospect_analytics_events_created_at_idx" ON "prospect_analytics_events"("created_at");

-- CreateIndex
CREATE INDEX "prospect_analytics_events_visitor_id_prospect_id_idx" ON "prospect_analytics_events"("visitor_id", "prospect_id");

-- CreateIndex
CREATE INDEX "prospect_analytics_events_last_seen_at_idx" ON "prospect_analytics_events"("last_seen_at");

-- CreateIndex
CREATE UNIQUE INDEX "prospect_analytics_events_session_id_prospect_id_key" ON "prospect_analytics_events"("session_id", "prospect_id");
