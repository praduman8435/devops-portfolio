/** Shared types for Gig Radar. Kept free of runtime imports so client and server can both use them. */

export const SOURCE_IDS = ["upwork", "freelancer", "hn", "remoteok", "wwr", "remotive", "x"] as const;
export type SourceId = (typeof SOURCE_IDS)[number];

export type Engagement = "freelance" | "contract" | "part-time" | "full-time" | "unknown";

export interface Budget {
  kind: "fixed" | "hourly" | "salary" | "unknown";
  min?: number;
  max?: number;
  currency?: string;
  /** Human-readable label straight from the source when it already formats one. */
  label?: string;
}

export interface ClientInfo {
  paymentVerified?: boolean;
  totalSpent?: number;
  hires?: number;
  jobsPosted?: number;
  rating?: number;
  reviews?: number;
  country?: string;
}

/** A job normalised from any source. */
export interface Job {
  /** Globally unique: `${source}:${nativeId}` */
  id: string;
  source: SourceId;
  title: string;
  url: string;
  /** Plain text, HTML stripped. */
  description: string;
  /** ISO 8601 */
  postedAt: string;
  budget: Budget;
  /** Proposals / bids so far; null when the source doesn't expose it. */
  bids: number | null;
  skills: string[];
  engagement: Engagement;
  company?: string;
  location?: string;
  experienceLevel?: string;
  client?: ClientInfo;
  /** Extra short signals, e.g. "12 replies". */
  meta?: string[];
}

export interface ScoreBreakdown {
  relevance: number;
  freshness: number;
  competition: number;
  client: number;
}

export interface ScoredJob extends Job {
  /** 0–100 overall fit */
  score: number;
  /** Profile keywords that matched, strongest first. */
  matched: string[];
  breakdown: ScoreBreakdown;
  /** Fresh and low-competition: apply now to land in the first proposals. */
  early: boolean;
}

export type SourceStatus = "ok" | "error" | "not-configured" | "not-connected" | "skipped";

export interface SourceReport {
  id: SourceId;
  status: SourceStatus;
  /** Jobs returned by the source before filtering. */
  fetched: number;
  /** Jobs from this source that survived filtering. */
  matched: number;
  ms?: number;
  message?: string;
}

export interface ScanOptions {
  sources: SourceId[];
  /** Only jobs posted within this many hours. */
  windowHours: number;
  /** Drop jobs with at least this many bids. null = no limit. */
  maxBids: number | null;
  /** Drop jobs whose bid count is unknown. */
  requireKnownBids: boolean;
  /** Keep only freelance, contract and part-time work (marketplaces are freelance by definition). */
  contractOnly: boolean;
}

export interface ScanResult {
  scannedAt: string;
  jobs: ScoredJob[];
  sources: SourceReport[];
  /** Total jobs considered across sources before filtering. */
  considered: number;
}

export interface SourceInfo {
  id: SourceId;
  name: string;
  /** What the source is good for. */
  blurb: string;
  /** Whether the source reports proposal/bid counts. */
  hasBids: boolean;
  /** Server-side readiness, computed per request. */
  state: "ready" | "needs-config" | "needs-connect";
  /** Link to the site, for attribution. */
  home: string;
}
