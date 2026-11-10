"use client";

import { memo } from "react";

import { ENGAGEMENT_LABEL, formatAgo, formatBids, formatBudget, formatMoney } from "@/lib/radar/format";
import type { ScoredJob, SourceId } from "@/lib/radar/types";
import { cn } from "@/lib/cn";
import { ArrowUpRight, CopyIcon } from "@/components/ui/icons";

export const SOURCE_STYLE: Record<SourceId, { label: string; className: string }> = {
  upwork: { label: "Upwork", className: "text-[#6fda44] border-[#6fda44]/35 bg-[#6fda44]/[0.07]" },
  freelancer: { label: "Freelancer", className: "text-[#29b2fe] border-[#29b2fe]/35 bg-[#29b2fe]/[0.07]" },
  hn: { label: "HN", className: "text-[#ff8a3d] border-[#ff8a3d]/35 bg-[#ff8a3d]/[0.07]" },
  remoteok: { label: "Remote OK", className: "text-[#ff5c8a] border-[#ff5c8a]/35 bg-[#ff5c8a]/[0.07]" },
  wwr: { label: "WWR", className: "text-[#c3a6ff] border-[#c3a6ff]/35 bg-[#c3a6ff]/[0.07]" },
  remotive: { label: "Remotive", className: "text-[#5ad8ff] border-[#5ad8ff]/35 bg-[#5ad8ff]/[0.07]" },
  x: { label: "X", className: "text-fg border-line-2 bg-white/[0.04]" },
};

function scoreTone(score: number): string {
  if (score >= 75) return "border-accent/50 bg-accent/10 text-accent";
  if (score >= 55) return "border-amber/45 bg-amber/10 text-amber";
  return "border-line-2 bg-white/[0.03] text-muted";
}

function bidsTone(bids: number | null): string {
  if (bids === null) return "text-dim";
  if (bids < 5) return "text-accent";
  if (bids < 10) return "text-amber";
  return "text-danger";
}

interface JobCardProps {
  job: ScoredJob;
  now: number;
  isNew: boolean;
  applied: boolean;
  hidden: boolean;
  onToggleApplied: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onCopy: (url: string) => void;
}

export const JobCard = memo(function JobCard({ job, now, isNew, applied, hidden, onToggleApplied, onToggleHidden, onCopy }: JobCardProps) {
  const src = SOURCE_STYLE[job.source];
  const c = job.client;
  const clientBits = c
    ? [
        c.paymentVerified ? "✓ payment verified" : c.paymentVerified === false ? "payment unverified" : null,
        c.totalSpent ? `${formatMoney(c.totalSpent)} spent` : null,
        typeof c.hires === "number" ? `${c.hires} hires` : null,
        c.rating ? `★ ${c.rating.toFixed(1)}${c.reviews ? ` (${c.reviews})` : ""}` : null,
        c.country ?? null,
      ].filter(Boolean)
    : [];

  return (
    <article
      className={cn(
        "rounded-lg border bg-panel/70 p-4 transition-colors sm:p-5",
        job.early ? "border-accent/35" : "border-line-2",
        (applied || hidden) && "opacity-55",
      )}
    >
      {/* signal row */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
        <span title="Fit score: relevance, freshness, competition, client" className={cn("rounded border px-1.5 py-0.5 font-semibold tabular-nums", scoreTone(job.score))}>
          {job.score}
        </span>
        <span className={cn("rounded border px-1.5 py-0.5", src.className)}>{src.label}</span>
        {job.early && <span className="rounded border border-accent/50 bg-accent/10 px-1.5 py-0.5 text-accent">apply early</span>}
        {isNew && <span className="rounded border border-cyan/45 bg-cyan/10 px-1.5 py-0.5 text-cyan">new</span>}
        {applied && <span className="rounded border border-line-2 px-1.5 py-0.5 text-muted">applied</span>}
        <time dateTime={job.postedAt} title={new Date(job.postedAt).toLocaleString()} className="ml-auto text-dim">
          {formatAgo(job.postedAt, now)}
        </time>
      </div>

      {/* title */}
      <h3 className="mt-2.5 text-[1.02rem] leading-snug font-semibold">
        <a href={job.url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
          {job.title}
        </a>
      </h3>
      {job.company && <p className="mt-0.5 text-sm text-muted">{job.company}</p>}

      {/* facts */}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-xs sm:flex sm:flex-wrap sm:gap-x-5">
        <div>
          <dt className="sr-only">Budget</dt>
          <dd className="text-fg">{formatBudget(job.budget)}</dd>
        </div>
        <div>
          <dt className="sr-only">Bids</dt>
          <dd className={bidsTone(job.bids)}>{formatBids(job.bids)}</dd>
        </div>
        <div>
          <dt className="sr-only">Type</dt>
          <dd className="text-muted">{ENGAGEMENT_LABEL[job.engagement]}</dd>
        </div>
        {job.experienceLevel && (
          <div>
            <dt className="sr-only">Level</dt>
            <dd className="text-muted">{job.experienceLevel}</dd>
          </div>
        )}
        {job.location && (
          <div>
            <dt className="sr-only">Location</dt>
            <dd className="truncate text-muted">{job.location}</dd>
          </div>
        )}
        {job.meta?.map((m) => (
          <div key={m}>
            <dt className="sr-only">Detail</dt>
            <dd className="text-muted">{m}</dd>
          </div>
        ))}
      </dl>

      {clientBits.length > 0 && <p className="mt-2 font-mono text-[11.5px] text-dim">client: {clientBits.join(" · ")}</p>}

      {/* why it matched */}
      {job.matched.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Matched skills">
          {job.matched.slice(0, 7).map((m) => (
            <li key={m} className="rounded-full border border-accent/20 bg-accent/[0.05] px-2 py-0.5 font-mono text-[10.5px] text-accent/90">
              {m}
            </li>
          ))}
        </ul>
      )}

      {/* description */}
      {job.description && (
        <details className="group/desc mt-3">
          <summary className="cursor-pointer list-none text-sm leading-relaxed text-muted [&::-webkit-details-marker]:hidden">
            <span className="line-clamp-3 group-open/desc:hidden">{job.description}</span>
            <span className="mt-1 inline-block font-mono text-xs text-dim group-hover/desc:text-accent group-open/desc:mt-0">
              <span className="group-open/desc:hidden">show full description ↓</span>
              <span className="hidden group-open/desc:inline">hide description ↑</span>
            </span>
          </summary>
          <p className="scroll-thin mt-2 max-h-80 overflow-y-auto pr-1 text-sm leading-relaxed whitespace-pre-line text-muted">{job.description}</p>
        </details>
      )}

      {/* actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3.5 font-mono text-[13px] font-semibold text-accent-ink transition-shadow hover:shadow-[0_0_24px_-6px_rgb(61_255_143/0.7)]"
        >
          open on {src.label} <ArrowUpRight className="size-3.5" />
        </a>
        <button type="button" onClick={() => onCopy(job.url)} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line-2 px-3 font-mono text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg">
          <CopyIcon className="size-3.5" /> link
        </button>
        <button type="button" aria-pressed={applied} onClick={() => onToggleApplied(job.id)} className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line-2 px-3 font-mono text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg">
          {applied ? "✓ applied" : "mark applied"}
        </button>
        <button type="button" aria-pressed={hidden} onClick={() => onToggleHidden(job.id)} className="ml-auto inline-flex h-9 cursor-pointer items-center rounded-md px-2 font-mono text-xs text-dim transition-colors hover:text-danger">
          {hidden ? "unhide" : "hide"}
        </button>
      </div>
    </article>
  );
});
