import type { Engagement } from "./types";

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
  "#x27": "'",
  "#x2F": "/",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

/** Decodes the common named and numeric HTML entities. */
export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    const named = ENTITIES[code] ?? ENTITIES[code.toLowerCase()];
    if (named !== undefined) return named;
    if (code.startsWith("#x") || code.startsWith("#X")) {
      const n = Number.parseInt(code.slice(2), 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    if (code.startsWith("#")) {
      const n = Number.parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return match;
  });
}

/** Converts an HTML fragment to readable plain text (paragraphs and list items become line breaks). */
export function htmlToText(html: string | null | undefined): string {
  if (!html) return "";
  const withBreaks = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    // HN separates paragraphs with bare, unclosed <p> tags, so opening tags must break too.
    .replace(/<p(\s[^>]*)?>/gi, "\n\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(withBreaks)
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

/** First non-empty line, trimmed to `max` characters on a word boundary. */
export function firstLine(text: string, max = 120): string {
  const line = text.split("\n").find((l) => l.trim().length > 0)?.trim() ?? "";
  if (line.length <= max) return line;
  const cut = line.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20))}…`;
}

/** Infers the engagement type from free text, most specific first. */
export function detectEngagement(text: string): Engagement {
  const t = text.toLowerCase();
  if (/\bfreelanc(e|er|ing)\b/.test(t)) return "freelance";
  if (/\bcontract(or|ors|ing)?\b|\bc2c\b|\b1099\b|\bfixed[\s-]term\b|\bhourly\b/.test(t)) return "contract";
  if (/\bpart[\s-]time\b/.test(t)) return "part-time";
  if (/\bfull[\s-]time\b|\bpermanent\b/.test(t)) return "full-time";
  return "unknown";
}

/** Parses a number from strings like "$1,200" or "1.5k"; returns undefined for junk. */
export function parseAmount(input: unknown): number | undefined {
  if (typeof input === "number") return Number.isFinite(input) ? input : undefined;
  if (typeof input !== "string") return undefined;
  const m = input.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(k)?/i);
  if (!m?.[1]) return undefined;
  const n = Number.parseFloat(m[1]) * (m[2] ? 1000 : 1);
  return Number.isFinite(n) ? n : undefined;
}

/** Converts unix seconds or a date string to ISO; falls back to "now" so a bad date never crashes a scan. */
export function toIso(input: number | string | null | undefined): string {
  if (typeof input === "number") return new Date(input * 1000).toISOString();
  if (typeof input === "string") {
    const d = new Date(input);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}
