/**
 * The only module app code should import for database access. Keeps the
 * generated-client path (src/generated/prisma) an implementation detail, so
 * regenerating or relocating it doesn't ripple through the codebase.
 */
export { prisma } from "./client";
export { Prisma } from "@/generated/prisma/client";
export {
  HubspotSyncStatus,
  ProspectStatus,
  SelectionMode,
} from "@/generated/prisma/enums";
export type { Prospect, ProspectTracking } from "@/generated/prisma/client";
