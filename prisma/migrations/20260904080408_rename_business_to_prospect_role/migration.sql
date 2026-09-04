-- Rename, not drop-and-add: the column changes meaning (business -> prospect role)
-- but existing values are the SDR's free text either way, and nothing is lost.
ALTER TABLE "prospects" RENAME COLUMN "business_name" TO "prospect_role";
