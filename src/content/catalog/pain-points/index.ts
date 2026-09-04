import type { CatalogEntry } from "../shared";
import { CONSOLIDATE_DISCONNECTED_TOOLS } from "./consolidate-disconnected-tools";
import { IMPROVE_PATIENT_REVIEWS } from "./improve-patient-reviews";
import { IMPROVE_RECALL_AND_REACTIVATION } from "./improve-recall-and-reactivation";
import { IMPROVE_TEAM_PERFORMANCE } from "./improve-team-performance";
import { INCREASE_CASE_ACCEPTANCE } from "./increase-case-acceptance";
import { INCREASE_COLLECTIONS } from "./increase-collections";
import { INCREASE_NEW_PATIENT_BOOKINGS } from "./increase-new-patient-bookings";
import { REDUCE_ADMINISTRATIVE_TASKS } from "./reduce-administrative-tasks";
import { REDUCE_NO_SHOWS } from "./reduce-no-shows";
import { STREAMLINE_INSURANCE } from "./streamline-insurance";

/**
 * The ten pain points, in the business-confirmed order, one file each.
 *
 * Every card follows the "Problem-led solution" layout in `./card` and was
 * transcribed from the template cards supplied on 2026-09-04. To change a
 * pain point's copy, edit its file — there is no database step.
 */
export const PAIN_POINTS: CatalogEntry[] = [
  REDUCE_ADMINISTRATIVE_TASKS,
  IMPROVE_TEAM_PERFORMANCE,
  IMPROVE_RECALL_AND_REACTIVATION,
  INCREASE_NEW_PATIENT_BOOKINGS,
  INCREASE_COLLECTIONS,
  INCREASE_CASE_ACCEPTANCE,
  REDUCE_NO_SHOWS,
  STREAMLINE_INSURANCE,
  CONSOLIDATE_DISCONNECTED_TOOLS,
  IMPROVE_PATIENT_REVIEWS,
];
