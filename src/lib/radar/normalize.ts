import { XMLParser } from "fast-xml-parser";

import { detectEngagement, firstLine, htmlToText, parseAmount, toIso } from "./text";
import type { Engagement, Job } from "./types";

/* ------------------------------------------------------------------ *
 * Pure mappers from each source's raw shape to a normalised Job.
 * Raw shapes were checked against live responses (Nov 2026).
 * Every field is treated as optional: a malformed item is skipped, and a scan never crashes.
 * ------------------------------------------------------------------ */

const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : parseAmount(v));
const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s_])([a-z])/g, (_, sep: string, c: string) => `${sep === "_" ? " " : sep}${c.toUpperCase()}`);

/* ---------- Upwork (GraphQL marketplaceJobPostingsSearch node) ---------- */

interface UpworkMoney {
  rawValue?: string | number;
  currency?: string;
  displayValue?: string;
}
export interface UpworkNode {
  id?: string;
  ciphertext?: string;
  title?: string;
  description?: string;
  createdDateTime?: string;
  publishedDateTime?: string;
  experienceLevel?: string;
  duration?: string;
  durationLabel?: string;
  engagement?: string;
  amount?: UpworkMoney;
  hourlyBudgetMin?: UpworkMoney;
  hourlyBudgetMax?: UpworkMoney;
  skills?: Array<{ name?: string; prettyName?: string }>;
  totalApplicants?: number;
  client?: {
    totalHires?: number;
    totalPostedJobs?: number;
    totalSpent?: UpworkMoney;
    verificationStatus?: string;
    location?: { country?: string };
    totalReviews?: number;
    totalFeedback?: number;
  };
}

export function upworkJobUrl(ciphertext: string | undefined, id: string | undefined): string {
  if (ciphertext) return `https://www.upwork.com/jobs/${ciphertext.startsWith("~") ? ciphertext : `~${ciphertext}`}`;
  return `https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent(id ?? "")}`;
}

export function normalizeUpwork(node: UpworkNode): Job | null {
  if (!node.id || !node.title) return null;
  const fixed = num(node.amount?.rawValue);
  const hMin = num(node.hourlyBudgetMin?.rawValue);
  const hMax = num(node.hourlyBudgetMax?.rawValue);
  const budget: Job["budget"] =
    fixed && fixed > 0
      ? { kind: "fixed", min: fixed, currency: node.amount?.currency ?? "USD" }
      : hMin || hMax
        ? { kind: "hourly", min: hMin, max: hMax, currency: node.hourlyBudgetMin?.currency ?? "USD" }
        : { kind: "unknown" };
  const c = node.client;
  return {
    id: `upwork:${node.id}`,
    source: "upwork",
    title: node.title,
    url: upworkJobUrl(node.ciphertext, node.id),
    description: htmlToText(node.description),
    postedAt: toIso(node.publishedDateTime ?? node.createdDateTime),
    budget,
    bids: typeof node.totalApplicants === "number" ? node.totalApplicants : null,
    skills: (node.skills ?? []).map((s) => s.prettyName || s.name || "").filter(Boolean),
    engagement: "freelance",
    experienceLevel: node.experienceLevel ? titleCase(node.experienceLevel) : undefined,
    client: c
      ? {
          paymentVerified: c.verificationStatus ? c.verificationStatus.toUpperCase() === "VERIFIED" : undefined,
          totalSpent: num(c.totalSpent?.rawValue),
          hires: c.totalHires,
          jobsPosted: c.totalPostedJobs,
          rating: c.totalFeedback,
          reviews: c.totalReviews,
          country: c.location?.country,
        }
      : undefined,
    meta: [node.durationLabel ?? node.duration, node.engagement].filter((m): m is string => Boolean(m)).map(titleCase),
  };
}

/* ---------- Freelancer.com (projects/0.1/projects/active) ---------- */

export interface FreelancerProject {
  id?: number;
  title?: string;
  seo_url?: string;
  description?: string;
  preview_description?: string;
  type?: "fixed" | "hourly";
  hidebids?: boolean;
  time_submitted?: number;
  currency?: { code?: string };
  budget?: { minimum?: number | null; maximum?: number | null };
  bid_stats?: { bid_count?: number };
  jobs?: Array<{ name?: string }>;
}

export function normalizeFreelancer(p: FreelancerProject): Job | null {
  if (!p.id || !p.title) return null;
  return {
    id: `freelancer:${p.id}`,
    source: "freelancer",
    title: p.title,
    url: p.seo_url ? `https://www.freelancer.com/projects/${p.seo_url}` : `https://www.freelancer.com/projects/${p.id}`,
    // Freelancer descriptions are Markdown-ish: drop emphasis and heading markers for clean previews.
    description: (p.description ?? p.preview_description ?? "")
      .replace(/\*\*|__/g, "")
      .replace(/^#{1,6}\s+/gm, "")
      .trim(),
    postedAt: toIso(p.time_submitted),
    budget: {
      kind: p.type === "hourly" ? "hourly" : "fixed",
      min: p.budget?.minimum ?? undefined,
      max: p.budget?.maximum ?? undefined,
      currency: p.currency?.code,
    },
    bids: p.hidebids ? null : typeof p.bid_stats?.bid_count === "number" ? p.bid_stats.bid_count : null,
    skills: (p.jobs ?? []).map((j) => j.name ?? "").filter(Boolean),
    engagement: "freelance",
  };
}

/* ---------- Hacker News "Who is hiring?" (Algolia comment hits) ---------- */

export interface HnHit {
  objectID?: string;
  parent_id?: number;
  story_id?: number;
  created_at?: string;
  author?: string;
  comment_text?: string;
}

export function normalizeHn(hit: HnHit, storyId: number): Job | null {
  if (!hit.objectID || hit.parent_id !== storyId || !hit.comment_text) return null; // top-level posts only
  const text = htmlToText(hit.comment_text);
  const title = firstLine(text, 140);
  if (!title) return null;
  return {
    id: `hn:${hit.objectID}`,
    source: "hn",
    title,
    url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
    description: text,
    postedAt: toIso(hit.created_at),
    budget: { kind: "unknown" },
    bids: null,
    skills: [],
    engagement: detectEngagement(text),
    company: title.split("|")[0]?.trim(),
    location: /\bremote\b/i.test(title) ? "Remote" : undefined,
    meta: ["HN · Who is hiring"],
  };
}

/* ---------- Remote OK (/api) ---------- */

export interface RemoteOkItem {
  id?: string | number;
  position?: string;
  company?: string;
  description?: string;
  date?: string;
  url?: string;
  tags?: string[];
  location?: string;
  salary_min?: number;
  salary_max?: number;
}

export function normalizeRemoteOk(j: RemoteOkItem): Job | null {
  if (!j.id || !j.position || !j.url) return null;
  const description = htmlToText(j.description);
  return {
    id: `remoteok:${j.id}`,
    source: "remoteok",
    title: j.position,
    url: j.url,
    description,
    postedAt: toIso(j.date),
    budget: j.salary_min || j.salary_max ? { kind: "salary", min: j.salary_min || undefined, max: j.salary_max || undefined, currency: "USD" } : { kind: "unknown" },
    bids: null,
    skills: j.tags ?? [],
    engagement: detectEngagement(`${j.position} ${description}`),
    company: j.company,
    location: j.location || "Remote",
  };
}

/* ---------- Remotive (/api/remote-jobs) ---------- */

export interface RemotiveItem {
  id?: number;
  url?: string;
  title?: string;
  company_name?: string;
  tags?: string[];
  job_type?: string;
  publication_date?: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
}

const REMOTIVE_TYPES: Record<string, Engagement> = {
  contract: "contract",
  freelance: "freelance",
  part_time: "part-time",
  full_time: "full-time",
};

export function normalizeRemotive(j: RemotiveItem): Job | null {
  if (!j.id || !j.title || !j.url) return null;
  const description = htmlToText(j.description);
  // Remotive dates have no zone; they are UTC.
  const posted = j.publication_date && !/[zZ]|[+-]\d\d:?\d\d$/.test(j.publication_date) ? `${j.publication_date}Z` : j.publication_date;
  return {
    id: `remotive:${j.id}`,
    source: "remotive",
    title: j.title,
    url: j.url,
    description,
    postedAt: toIso(posted),
    budget: j.salary ? { kind: "salary", label: j.salary } : { kind: "unknown" },
    bids: null,
    skills: j.tags ?? [],
    engagement: REMOTIVE_TYPES[j.job_type ?? ""] ?? detectEngagement(description),
    company: j.company_name,
    location: j.candidate_required_location,
  };
}

/* ---------- We Work Remotely (category RSS) ---------- */

const xml = new XMLParser({ ignoreAttributes: true, trimValues: true, processEntities: true, htmlEntities: true });

interface WwrItem {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  type?: string;
  skills?: string;
  region?: string;
  description?: string;
}

export function parseWwrRss(rss: string): Job[] {
  const doc = xml.parse(rss) as { rss?: { channel?: { item?: WwrItem | WwrItem[] } } };
  const raw = doc.rss?.channel?.item;
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return items.map(normalizeWwr).filter((j): j is Job => j !== null);
}

export function normalizeWwr(item: WwrItem): Job | null {
  const link = str(item.link) || str(item.guid);
  const fullTitle = str(item.title);
  if (!link || !fullTitle) return null;
  const sep = fullTitle.indexOf(":");
  const company = sep > 0 ? fullTitle.slice(0, sep).trim() : undefined;
  const title = sep > 0 ? fullTitle.slice(sep + 1).trim() : fullTitle;
  const description = htmlToText(str(item.description));
  const type = str(item.type).toLowerCase();
  return {
    id: `wwr:${link.replace(/^https?:\/\/[^/]+/, "")}`,
    source: "wwr",
    title,
    url: link,
    description,
    postedAt: toIso(str(item.pubDate)),
    budget: { kind: "unknown" },
    bids: null,
    skills: str(item.skills)
      .split(",")
      .map((s) => s.replace(/\band\b/i, "").trim())
      .filter(Boolean),
    engagement: type.includes("contract") ? "contract" : type.includes("full") ? "full-time" : type.includes("part") ? "part-time" : detectEngagement(description),
    company,
    location: str(item.region) || "Remote",
  };
}

/* ---------- X / Twitter (API v2 recent search) ---------- */

export interface XSearchResponse {
  data?: Array<{ id: string; text: string; created_at?: string; author_id?: string; public_metrics?: { reply_count?: number } }>;
  includes?: { users?: Array<{ id: string; username: string; name?: string }> };
}

export function normalizeX(res: XSearchResponse): Job[] {
  const users = new Map((res.includes?.users ?? []).map((u) => [u.id, u]));
  return (res.data ?? []).map((t) => {
    const user = t.author_id ? users.get(t.author_id) : undefined;
    const handle = user?.username ?? "i";
    const replies = t.public_metrics?.reply_count;
    return {
      id: `x:${t.id}`,
      source: "x" as const,
      title: firstLine(t.text, 140),
      url: `https://x.com/${handle}/status/${t.id}`,
      description: t.text,
      postedAt: toIso(t.created_at),
      budget: { kind: "unknown" as const },
      bids: null,
      skills: [],
      engagement: detectEngagement(t.text),
      company: user ? `@${user.username}` : undefined,
      meta: typeof replies === "number" ? [`${replies} ${replies === 1 ? "reply" : "replies"}`] : undefined,
    };
  });
}
