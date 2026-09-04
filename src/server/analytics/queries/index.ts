/**
 * Every analytics read goes through here, so a page never touches raw SQL and
 * the authorization check stays in one layer above it.
 *
 * All five groupings share `METRIC_COLUMNS` and `toMetrics` from `./metrics`,
 * which is what guarantees the summary cards, the SDR table, the date
 * breakdown and a single prospect's page all compute the same
 * numbers the same way.
 */

export * from "./filters";
export * from "./metrics";
export * from "./summary";
export * from "./by-prospect";
export * from "./by-sdr";
export * from "./by-date";
export * from "./prospect-detail";
export * from "./active";
