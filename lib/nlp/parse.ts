import * as chrono from "chrono-node";

export interface NlpResult {
  cleanTitle: string;
  date: string | null;           // ISO string
  dateLabel: string | null;      // Human-readable "Fri 9 May"
  ambiguousDate: string | null;  // For uncertain parses
  priority: "high" | "medium" | null;
  tags: string[];
  durationMinutes: number | null;
  unparsedTokens: string[];      // HV-018: tokens that failed parse
}

// Shorthand patterns
const PRIORITY_RE = /(!{1,3})\s*/g;
const TAG_RE = /#(\w+)/g;
const DURATION_RE = /~(\d+)(m|h)\b/g;
const AT_DATE_RE = /@(\S+)/g;

export function parseNlp(raw: string): NlpResult {
  let text = raw;
  const tags: string[] = [];
  const unparsedTokens: string[] = [];
  let priority: "high" | "medium" | null = null;
  let durationMinutes: number | null = null;
  let date: string | null = null;
  let dateLabel: string | null = null;
  let ambiguousDate: string | null = null;

  // Extract tags (#word)
  const tagMatches = [...text.matchAll(TAG_RE)];
  tagMatches.forEach((m) => tags.push(m[1].toLowerCase()));
  text = text.replace(TAG_RE, "").trim();

  // Extract duration (~30m ~2h)
  const durMatch = [...text.matchAll(DURATION_RE)];
  if (durMatch.length) {
    const m = durMatch[0];
    durationMinutes = m[2] === "h" ? parseInt(m[1]) * 60 : parseInt(m[1]);
    text = text.replace(DURATION_RE, "").trim();
  }

  // Extract priority (! = high, !! = medium)
  const prioMatch = [...text.matchAll(PRIORITY_RE)];
  if (prioMatch.length) {
    priority = prioMatch[0][1].length >= 2 ? "medium" : "high";
    text = text.replace(PRIORITY_RE, "").trim();
  }

  // Extract @date tokens and parse with chrono-node
  const atMatches = [...text.matchAll(AT_DATE_RE)];
  for (const m of atMatches) {
    const token = m[0]; // e.g. @fri
    const parsed = chrono.parseDate(m[1], new Date(), { forwardDate: true });
    if (parsed) {
      date = parsed.toISOString();
      dateLabel = parsed.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      text = text.replace(token, "").trim();
    } else {
      // HV-018: mark as unparsed
      unparsedTokens.push(token);
    }
  }

  // Also try chrono on remaining text for natural language dates
  if (!date) {
    const results = chrono.parse(text, new Date(), { forwardDate: true });
    if (results.length > 0) {
      const r = results[0];
      date = r.date().toISOString();
      const isAmbiguous = !r.start.isCertain("day");
      if (isAmbiguous) {
        ambiguousDate = r.date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
        date = null;
      } else {
        dateLabel = r.date().toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric"
        });
        text = text.replace(r.text, "").trim();
      }
    }
  }

  // Clean up extra whitespace
  const cleanTitle = text.replace(/\s+/g, " ").trim();

  return { cleanTitle, date, dateLabel, ambiguousDate, priority, tags, durationMinutes, unparsedTokens };
}
