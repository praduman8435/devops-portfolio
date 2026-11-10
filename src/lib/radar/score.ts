import { KEYWORDS, NEGATIVE_KEYWORDS, type Keyword } from "./profile";
import type { ClientInfo, Job, ScanOptions, ScoredJob } from "./types";

/* ------------------------------------------------------------------ *
 * Pure ranking engine. There's no I/O here, so it's fully unit-tested.
 * ------------------------------------------------------------------ */

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordPattern = (term: string) => new RegExp(`(?<![a-z0-9])${escapeRegExp(term)}(?![a-z0-9])`, "i");

const compiled: Array<Keyword & { re: RegExp }> = KEYWORDS.map((k) => ({ ...k, re: k.pattern ?? wordPattern(k.term) }));
const negatives = NEGATIVE_KEYWORDS.map((term) => ({ term, re: wordPattern(term) }));

/** Where a keyword was found matters: the title says what the job *is*. */
const FIELD_WEIGHT = { title: 3, skills: 2, description: 1 } as const;

export interface RelevanceResult {
  /** 0–100 */
  score: number;
  /** Matched profile terms, strongest first. */
  matched: string[];
  /** Whether the job clears the profile gate at all. */
  relevant: boolean;
}

/** Freelance marketplaces often have vague titles ("Need help with our servers"), so the description may qualify them. */
const MARKETPLACES = new Set<Job["source"]>(["upwork", "freelancer"]);

export function scoreRelevance(job: Pick<Job, "title" | "description" | "skills">, opts: { descriptionCanQualify?: boolean } = {}): RelevanceResult {
  const fields = {
    title: job.title,
    skills: job.skills.join(" · "),
    description: job.description.slice(0, 6000),
  };

  let raw = 0;
  let coreInHeadline = false; // a weight-3 term in title or skills
  let strongInHeadline = 0;
  const hits = new Map<string, number>();

  for (const k of compiled) {
    let best = 0;
    for (const [field, text] of Object.entries(fields) as Array<[keyof typeof fields, string]>) {
      if (!text || !k.re.test(text)) continue;
      const pts = k.weight * FIELD_WEIGHT[field];
      raw += pts;
      best = Math.max(best, pts);
      if (field !== "description") {
        if (k.weight === 3) coreInHeadline = true;
        if (k.weight === 2) strongInHeadline += 1;
      }
    }
    if (best > 0) hits.set(k.term, best);
  }

  // Off-profile work: disqualifying in the title, a penalty elsewhere.
  const negativeInTitle = negatives.some((n) => n.re.test(fields.title));
  const negativeElsewhere = negatives.filter((n) => n.re.test(fields.description) || n.re.test(fields.skills)).length;
  raw = Math.max(0, raw - negativeElsewhere * 4);

  const coreTerms = [...hits.keys()].filter((term) => compiled.find((k) => k.term === term)?.weight === 3).length;
  const viaDescription = opts.descriptionCanQualify === true && coreTerms >= 2 && raw >= 14;
  const relevant = !negativeInTitle && (coreInHeadline || strongInHeadline >= 2 || viaDescription);

  // Saturating curve: the first few strong matches matter most.
  const score = Math.round(100 * (1 - Math.exp(-raw / 14)));
  const matched = [...hits.entries()].sort((a, b) => b[1] - a[1]).map(([term]) => term);

  return { score: relevant ? score : 0, matched, relevant };
}

/** 100 when brand new, about 50 at 5.5h, near 0 after a day. */
export function scoreFreshness(postedAt: string, now: number = Date.now()): number {
  const hours = Math.max(0, (now - new Date(postedAt).getTime()) / 3_600_000);
  return Math.round(100 * Math.exp(-hours / 8));
}

/** 100 with no bids, dropping smoothly. Unknown counts are treated as average. */
export function scoreCompetition(bids: number | null): number {
  if (bids === null) return 55;
  return Math.round(100 * Math.exp(-Math.max(0, bids) / 8));
}

/** Client trust signals: verified payment, money spent, hiring history, rating. */
export function scoreClient(client: ClientInfo | undefined): number {
  if (!client) return 50;
  let s = 30;
  if (client.paymentVerified) s += 30;
  if ((client.totalSpent ?? 0) > 0) s += 10;
  if ((client.totalSpent ?? 0) >= 1_000) s += 10;
  if ((client.totalSpent ?? 0) >= 10_000) s += 5;
  if ((client.hires ?? 0) >= 1) s += 5;
  if ((client.rating ?? 0) >= 4.5) s += 10;
  return Math.min(100, s);
}

const CONTRACT_TYPES = new Set<Job["engagement"]>(["freelance", "contract", "part-time"]);

export const WEIGHTS = { relevance: 0.45, freshness: 0.25, competition: 0.2, client: 0.1 } as const;

export function scoreJob(job: Job, now: number = Date.now()): ScoredJob & { relevant: boolean } {
  const rel = scoreRelevance(job, { descriptionCanQualify: MARKETPLACES.has(job.source) });
  const breakdown = {
    relevance: rel.score,
    freshness: scoreFreshness(job.postedAt, now),
    competition: scoreCompetition(job.bids),
    client: scoreClient(job.client),
  };
  const score = Math.round(
    breakdown.relevance * WEIGHTS.relevance +
      breakdown.freshness * WEIGHTS.freshness +
      breakdown.competition * WEIGHTS.competition +
      breakdown.client * WEIGHTS.client,
  );
  const ageHours = (now - new Date(job.postedAt).getTime()) / 3_600_000;
  const early = ageHours <= 3 && job.bids !== null && job.bids < 5;
  return { ...job, score, matched: rel.matched, breakdown, early, relevant: rel.relevant };
}

/** Normalised key used to collapse the same role cross-posted on several boards. */
export function dedupeKey(job: Pick<Job, "title" | "company">): string {
  const norm = (s = "") => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return `${norm(job.company)}|${norm(job.title)}`;
}

/**
 * Full pipeline: score → gate on relevance → time window → bids → engagement → de-duplicate → sort.
 * Returns the jobs that survive, best first.
 */
export function rankJobs(jobs: Job[], opts: Omit<ScanOptions, "sources">, now: number = Date.now()): ScoredJob[] {
  const cutoff = now - opts.windowHours * 3_600_000;
  const seen = new Map<string, ScoredJob>();

  for (const job of jobs) {
    const posted = new Date(job.postedAt).getTime();
    if (Number.isNaN(posted) || posted < cutoff) continue;
    if (opts.maxBids !== null && job.bids !== null && job.bids >= opts.maxBids) continue;
    if (opts.requireKnownBids && job.bids === null) continue;
    if (opts.contractOnly && !CONTRACT_TYPES.has(job.engagement)) continue;

    const { relevant, ...scored } = scoreJob(job, now);
    if (!relevant) continue;

    const key = dedupeKey(job);
    const existing = seen.get(key);
    // Keep the copy with more information (known bids beat unknown), else the higher score.
    if (!existing || (existing.bids === null && scored.bids !== null) || scored.score > existing.score) {
      seen.set(key, scored);
    }
  }

  return [...seen.values()].sort((a, b) => b.score - a.score || Date.parse(b.postedAt) - Date.parse(a.postedAt));
}
