/**
 * Blog dates, in the two forms a page needs them.
 *
 * The blog `date` field is `z.coerce.string()` (each template's schema.ts), so a bare
 * YAML date like `2026-08-01` arrives as a Date and coerces to its toString form —
 * "Sat Aug 01 2026 05:00:00 GMT+0500 (Pakistan Standard Time)". That string is invalid
 * in a <time datetime> attribute and in schema.org's date fields, and it carries the
 * build machine's timezone, so the same source produced different output on a laptop
 * in PKT and a CI runner in UTC.
 *
 * The display side had the sharper edge: a bare YAML date parses as UTC midnight, so
 * rendering it in local time on any machine west of UTC lands on the previous day —
 * `2026-08-01` printed as "July 31, 2026" under America/New_York. Both helpers below
 * therefore read UTC components and never the build machine's zone.
 */

/** ISO 8601 (YYYY-MM-DD) — for <time datetime> and schema.org date fields. */
export function isoDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().slice(0, 10);
}

/** "August 1, 2026" — the human-facing form, pinned to UTC for the reason above. */
export function displayDate(value: string): string {
  const parsed = new Date(isoDate(value));
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
