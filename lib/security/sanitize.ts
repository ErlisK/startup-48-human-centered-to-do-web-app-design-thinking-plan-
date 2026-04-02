/**
 * Pure input sanitisation functions — no framework dependencies.
 * Imported by both API routes and tests without Next.js globals.
 */

/** Strip dangerous HTML/script patterns from user-provided strings */
export function sanitizeText(input: string, maxLength = 500): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .trim()
    .slice(0, maxLength);
}

/** Validate a priority value (1–4 or null) */
export function sanitizePriority(p: unknown): number | null {
  const n = Number(p);
  if (isNaN(n)) return null;
  if (n < 1 || n > 4) return null;
  return Math.round(n);
}

/** Validate an ISO date string. Returns null if invalid. */
export function sanitizeDate(d: unknown): string | null {
  if (!d || typeof d !== "string") return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

/** Validate tags array: strings only, max 20 tags, each max 50 chars */
export function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t) => typeof t === "string")
    .map((t) => sanitizeText(String(t), 50))
    .filter(Boolean)
    .slice(0, 20);
}
