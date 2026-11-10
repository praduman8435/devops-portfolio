import { describe, expect, it } from "vitest";

import { dedupeKey, rankJobs, scoreClient, scoreCompetition, scoreFreshness, scoreRelevance } from "./score";
import type { Job } from "./types";

const NOW = Date.parse("2026-11-10T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000).toISOString();

const job = (over: Partial<Job> = {}): Job => ({
  id: `freelancer:${Math.random()}`,
  source: "freelancer",
  title: "Set up Kubernetes cluster on AWS EKS with Terraform",
  url: "https://example.com",
  description: "Need a DevOps engineer to build CI/CD with GitHub Actions and Helm.",
  postedAt: hoursAgo(1),
  budget: { kind: "fixed", min: 500, currency: "USD" },
  bids: 2,
  skills: ["Kubernetes", "AWS", "Terraform"],
  engagement: "freelance",
  ...over,
});

const opts = { windowHours: 24, maxBids: 5, requireKnownBids: false, contractOnly: true };

describe("scoreRelevance", () => {
  it("rates core DevOps work highly and explains why", () => {
    const r = scoreRelevance(job());
    expect(r.relevant).toBe(true);
    expect(r.score).toBeGreaterThan(80);
    expect(r.matched.slice(0, 3)).toEqual(expect.arrayContaining(["kubernetes", "terraform"]));
  });

  it("rejects off-profile work even when the description mentions cloud", () => {
    const r = scoreRelevance(job({ title: "WordPress theme customization", skills: ["WordPress", "PHP"], description: "Site hosted on AWS." }));
    expect(r.relevant).toBe(false);
    expect(r.score).toBe(0);
  });

  it("matches whole words only (no 'sre' inside 'pressure')", () => {
    const r = scoreRelevance(job({ title: "Pressure washing business website", skills: [], description: "Need a landing page." }));
    expect(r.relevant).toBe(false);
  });

  it("lets marketplace descriptions qualify vague titles, but not job-board ones", () => {
    const vague = { title: "Need help with our servers", skills: [], description: "We run Kubernetes on EKS with Terraform and Helm; need DevOps help." };
    expect(scoreRelevance(vague, { descriptionCanQualify: true }).relevant).toBe(true);
    expect(scoreRelevance(vague).relevant).toBe(false);
  });

  it("handles plurals and common variants", () => {
    expect(scoreRelevance({ title: "Hiring Platform engineers (contract)", skills: [], description: "" }).relevant).toBe(true);
    expect(scoreRelevance({ title: "Linux Admin + AWS, part-time", skills: [], description: "" }).relevant).toBe(true);
  });

  it("accepts strong-signal combos without a core keyword", () => {
    const r = scoreRelevance(job({ title: "AWS + Docker + Jenkins help", skills: [], description: "" }));
    expect(r.relevant).toBe(true);
  });
});

describe("component scores", () => {
  it("freshness decays from 100", () => {
    expect(scoreFreshness(hoursAgo(0), NOW)).toBe(100);
    expect(scoreFreshness(hoursAgo(6), NOW)).toBeLessThan(50);
    expect(scoreFreshness(hoursAgo(24), NOW)).toBeLessThan(6);
  });

  it("competition favours few bids and is neutral when unknown", () => {
    expect(scoreCompetition(0)).toBe(100);
    expect(scoreCompetition(4)).toBeGreaterThan(scoreCompetition(10));
    expect(scoreCompetition(null)).toBe(55);
  });

  it("client trust rewards verification and spend", () => {
    expect(scoreClient({ paymentVerified: true, totalSpent: 25_000, hires: 12, rating: 4.9 })).toBe(100);
    expect(scoreClient({ paymentVerified: false })).toBe(30);
    expect(scoreClient(undefined)).toBe(50);
  });
});

describe("rankJobs", () => {
  it("applies the window, bid cap, contract-only filter and relevance gate", () => {
    const jobs = [
      job({ id: "a" }),
      job({ id: "old", postedAt: hoursAgo(30) }),
      job({ id: "crowded", bids: 12 }),
      job({ id: "fulltime", engagement: "full-time", source: "remoteok", bids: null }),
      job({ id: "unknown-type", title: "Kubernetes platform role", engagement: "unknown", source: "remoteok", bids: null }),
      job({ id: "offtopic", title: "Logo design for bakery", skills: ["Graphic Design"], description: "" }),
    ];
    expect(rankJobs(jobs, opts, NOW).map((j) => j.id)).toEqual(["a"]);
  });

  it("keeps unknown-bid jobs unless known bids are required", () => {
    const unknown = job({ id: "u", bids: null, source: "hn", engagement: "contract" });
    expect(rankJobs([unknown], opts, NOW)).toHaveLength(1);
    expect(rankJobs([unknown], { ...opts, requireKnownBids: true }, NOW)).toHaveLength(0);
  });

  it("sorts best fit first and flags early, low-competition jobs", () => {
    const ranked = rankJobs(
      [
        job({ id: "older", title: "Terraform modules for our AWS platform", postedAt: hoursAgo(10), bids: 4 }),
        job({ id: "fresh", title: "Kubernetes cluster hardening on EKS", postedAt: hoursAgo(0.2), bids: 0 }),
      ],
      opts,
      NOW,
    );
    expect(ranked.map((j) => j.id)).toEqual(["fresh", "older"]);
    expect(ranked[0]?.early).toBe(true);
    expect(ranked[1]?.early).toBe(false);
  });

  it("de-duplicates cross-posted roles, preferring the copy with a bid count", () => {
    const a = job({ id: "remoteok:1", source: "remoteok", bids: null, company: "Acme", title: "DevOps Engineer (Contract)" });
    const b = job({ id: "freelancer:1", company: "ACME", title: "DevOps engineer - contract", bids: 1 });
    const ranked = rankJobs([a, b], opts, NOW);
    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.id).toBe("freelancer:1");
    expect(dedupeKey(a)).toBe(dedupeKey(b));
  });
});
