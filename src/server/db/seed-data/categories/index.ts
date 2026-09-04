import type { SeedEntry } from "../shared";
import { ALL_IN_ONE_DENTAL_SOFTWARE } from "./all-in-one-dental-software";
import { BUSINESS_ANALYTICS } from "./business-analytics";
import { PATIENT_RELATIONSHIP_MANAGEMENT } from "./patient-relationship-management";
import { OPERATIONAL_EFFICIENCY } from "./operational-efficiency";
import { PBN_AI } from "./pbn-ai";
import { PBN_VOICE } from "./pbn-voice";
import { DENTAL_MARKETING } from "./dental-marketing";
import { PBN_PAYMENTS } from "./pbn-payments";
import { SMART_FORMS } from "./smart-forms";
import { PBN_AI_RECEPTIONIST } from "./pbn-ai-receptionist";

/**
 * The ten solution categories, one file each, listed here in `sortOrder`.
 * The order of this array is NOT what the page uses — each entry's own
 * `sortOrder` is — but keeping them aligned makes the list easy to read.
 *
 * To change a category's content, edit its file and run `npm run db:seed`.
 */
export const CATEGORY_SEED: SeedEntry[] = [
  ALL_IN_ONE_DENTAL_SOFTWARE,
  BUSINESS_ANALYTICS,
  PATIENT_RELATIONSHIP_MANAGEMENT,
  OPERATIONAL_EFFICIENCY,
  PBN_AI,
  PBN_VOICE,
  DENTAL_MARKETING,
  PBN_PAYMENTS,
  SMART_FORMS,
  PBN_AI_RECEPTIONIST,
];
