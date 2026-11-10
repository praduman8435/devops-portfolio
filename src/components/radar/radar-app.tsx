"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { disconnectUpwork, logout } from "@/app/radar/actions";
import { buildQuickLinks } from "@/lib/radar/quick-links";
import type { ScanOptions, ScanResult, ScoredJob, SourceId, SourceInfo, SourceReport } from "@/lib/radar/types";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { ArrowUpRight, CopyIcon, SearchIcon } from "@/components/ui/icons";
import { JobCard, SOURCE_STYLE } from "./job-card";

/* ---------------- persisted state ---------------- */

interface Settings {
  enabled: Record<SourceId, boolean>;
  windowHours: number;
  maxBids: number | null;
  requireKnownBids: boolean;
  contractOnly: boolean;
  sort: "score" | "newest";
  autoScan: boolean;
  showHidden: boolean;
}

interface Marks {
  applied: string[];
  hidden: string[];
  /** Job ids already shown in an earlier scan, so new ones can be flagged. Capped. */
  seen: string[];
}

const DEFAULT_SETTINGS: Settings = {
  enabled: { upwork: true, freelancer: true, hn: true, remoteok: true, wwr: true, remotive: true, x: true },
  windowHours: 24,
  maxBids: 5,
  requireKnownBids: false,
  contractOnly: true,
  sort: "score",
  autoScan: false,
  showHidden: false,
};

const SEEN_CAP = 3000;
const AUTO_SCAN_MS = 5 * 60_000;

function readStored<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

/** useState backed by localStorage. This component is client-only, so reading during init is safe. */
function useStored<T extends object>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStored(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode or full storage: keep working in memory */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

/* ---------------- small UI atoms ---------------- */

function Segmented<T extends string | number | null>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-line-2 bg-bg/60 p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "cursor-pointer rounded px-2.5 py-1 font-mono text-xs transition-colors",
            value === o.value ? "bg-accent/15 text-accent" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 font-mono text-xs text-muted select-none hover:text-fg">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-4 w-7 rounded-full border border-line-2 bg-bg transition-colors peer-checked:border-accent/60 peer-checked:bg-accent/20 peer-focus-visible:outline-2 peer-focus-visible:outline-accent after:absolute after:top-[2px] after:left-[2px] after:size-2.5 after:rounded-full after:bg-dim after:transition-transform peer-checked:after:translate-x-3 peer-checked:after:bg-accent"
      />
      {children}
    </label>
  );
}

const STATUS_TEXT: Record<SourceReport["status"], string> = {
  ok: "ok",
  error: "error",
  "not-configured": "needs setup",
  "not-connected": "not connected",
  skipped: "skipped",
};

/* ---------------- app ---------------- */

interface RadarAppProps {
  sources: SourceInfo[];
  notice: { tone: "ok" | "error"; text: string } | null;
  upworkCallbackUrl: string;
}

export function RadarApp({ sources, notice, upworkCallbackUrl }: RadarAppProps) {
  const [settings, setSettings] = useStored<Settings>("radar:settings", DEFAULT_SETTINGS);
  const [marks, setMarks] = useStored<Marks>("radar:marks", { applied: [], hidden: [], seen: [] });
  const [result, setResult] = useState<ScanResult | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const inFlight = useRef(false);
  const marksRef = useRef(marks);
  useEffect(() => {
    marksRef.current = marks;
  }, [marks]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((s) => ({ ...s, [k]: v }));

  const activeSources = useMemo(
    () => sources.filter((s) => settings.enabled[s.id] !== false && s.state === "ready").map((s) => s.id),
    [sources, settings.enabled],
  );

  const scan = useCallback(
    async (mode: "manual" | "auto") => {
      if (inFlight.current) return;
      if (activeSources.length === 0) {
        setError("Enable at least one ready source.");
        return;
      }
      inFlight.current = true;
      setLoading(true);
      setError(null);
      try {
        const body: ScanOptions = {
          sources: activeSources,
          windowHours: settings.windowHours,
          maxBids: settings.maxBids,
          requireKnownBids: settings.requireKnownBids,
          contractOnly: settings.contractOnly,
        };
        const res = await fetch("/api/radar/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (res.status === 401) {
          window.location.reload();
          return;
        }
        const data = (await res.json()) as ScanResult & { error?: string };
        if (!res.ok) throw new Error(data.error ?? `Scan failed (HTTP ${res.status})`);

        const seen = new Set(marksRef.current.seen);
        const fresh = data.jobs.filter((j) => !seen.has(j.id));
        setResult(data);
        setNow(Date.now());
        setNewIds(new Set(seen.size === 0 ? [] : fresh.map((j) => j.id))); // first ever scan: nothing is "new"
        setMarks((m) => ({ ...m, seen: [...fresh.map((j) => j.id), ...m.seen].slice(0, SEEN_CAP) }));

        const hot = fresh.filter((j) => j.early || j.score >= 70);
        if (mode === "auto" && seen.size > 0 && hot.length > 0 && document.hidden && "Notification" in window && Notification.permission === "granted") {
          new Notification(`Gig Radar: ${hot.length} new match${hot.length > 1 ? "es" : ""}`, { body: hot[0]?.title, tag: "gig-radar" });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Scan failed");
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [activeSources, settings.windowHours, settings.maxBids, settings.requireKnownBids, settings.contractOnly, setMarks],
  );

  // Auto-scan: right away, then every 5 minutes while the tab is open.
  useEffect(() => {
    if (!settings.autoScan) return;
    const first = window.setTimeout(() => void scan("auto"), 0);
    const id = window.setInterval(() => void scan("auto"), AUTO_SCAN_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [settings.autoScan, scan]);

  // Keep relative times fresh.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Unseen-match count in the tab title.
  useEffect(() => {
    document.title = newIds.size > 0 ? `(${newIds.size}) Gig Radar` : "Gig Radar";
  }, [newIds]);

  const toggleIn = useCallback(
    (list: "applied" | "hidden") => (id: string) =>
      setMarks((m) => ({ ...m, [list]: m[list].includes(id) ? m[list].filter((x) => x !== id) : [id, ...m[list]].slice(0, SEEN_CAP) })),
    [setMarks],
  );
  const onToggleApplied = useMemo(() => toggleIn("applied"), [toggleIn]);
  const onToggleHidden = useMemo(() => toggleIn("hidden"), [toggleIn]);
  const onCopy = useCallback(async (url: string) => toast((await copyToClipboard(url)) ? "✓ link copied" : "Copy failed"), []);

  const visible = useMemo(() => {
    if (!result) return [];
    const q = filter.trim().toLowerCase();
    const hidden = new Set(marks.hidden);
    const list = result.jobs.filter(
      (j) =>
        (settings.showHidden || !hidden.has(j.id)) &&
        (!q || `${j.title} ${j.company ?? ""} ${j.skills.join(" ")} ${j.description}`.toLowerCase().includes(q)),
    );
    return settings.sort === "newest" ? [...list].sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt)) : list;
  }, [result, filter, marks.hidden, settings.showHidden, settings.sort]);

  const reports = useMemo(() => new Map((result?.sources ?? []).map((r) => [r.id, r])), [result]);
  const earlyCount = visible.filter((j) => j.early).length;
  const quickLinks = useMemo(() => buildQuickLinks(settings.windowHours), [settings.windowHours]);
  const appliedSet = useMemo(() => new Set(marks.applied), [marks.applied]);
  const hiddenSet = useMemo(() => new Set(marks.hidden), [marks.hidden]);

  const enableAutoScan = async (on: boolean) => {
    set("autoScan", on);
    if (on && "Notification" in window && Notification.permission === "default") await Notification.requestPermission();
  };

  return (
    <div className="min-h-svh">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="container-page flex h-14 items-center gap-3">
          <Link href="/" className="font-mono text-sm font-bold tracking-[-0.02em]">
            <span className="text-accent">~/</span>radar
          </Link>
          <span className="rounded-full border border-line-2 px-2 py-0.5 font-mono text-[10.5px] text-dim">private</span>
          {result && (
            <span className="hidden font-mono text-xs text-dim sm:inline">
              last scan {new Date(result.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <form action={logout} className="ml-auto">
            <button type="submit" className="cursor-pointer font-mono text-xs text-muted hover:text-fg">
              sign out
            </button>
          </form>
        </div>
      </header>

      <main className="container-page grid grid-cols-1 gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
        <section aria-label="Results" className="min-w-0">
          <div className="mb-5">
            <h1 className="font-mono text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Gig Radar</h1>
            <p className="mt-1 text-sm text-muted">
              Fresh DevOps, SRE, platform and infrastructure gigs, ranked by fit, with the fewest bids first in line.
            </p>
          </div>

          {notice && (
            <p
              role="status"
              className={cn(
                "mb-4 rounded-md border px-3.5 py-2.5 font-mono text-xs",
                notice.tone === "ok" ? "border-accent/40 bg-accent/5 text-accent" : "border-danger/40 bg-danger/5 text-danger",
              )}
            >
              {notice.text}
            </p>
          )}

          {/* controls */}
          <div className="rounded-lg border border-line-2 bg-panel/60 p-3.5 sm:p-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => void scan("manual")}
                disabled={loading}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-accent px-4 font-mono text-sm font-semibold text-accent-ink transition-shadow hover:shadow-[0_0_28px_-6px_rgb(61_255_143/0.7)] disabled:cursor-wait disabled:opacity-70"
              >
                <span aria-hidden="true" className={cn("size-2 rounded-full bg-accent-ink", loading && "animate-pulse")} />
                {loading ? `scanning ${activeSources.length} sources…` : "find gigs"}
              </button>
              <Segmented
                label="Posted within"
                value={settings.windowHours}
                onChange={(v) => set("windowHours", v)}
                options={[
                  { value: 6, label: "6h" },
                  { value: 24, label: "24h" },
                  { value: 72, label: "3d" },
                  { value: 168, label: "7d" },
                ]}
              />
              <Segmented
                label="Maximum bids"
                value={settings.maxBids}
                onChange={(v) => set("maxBids", v)}
                options={[
                  { value: 5, label: "<5 bids" },
                  { value: 10, label: "<10" },
                  { value: 20, label: "<20" },
                  { value: null, label: "any" },
                ]}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              <Toggle checked={settings.contractOnly} onChange={(v) => set("contractOnly", v)}>
                contract &amp; freelance only
              </Toggle>
              <Toggle checked={settings.requireKnownBids} onChange={(v) => set("requireKnownBids", v)}>
                only with bid counts
              </Toggle>
              <Toggle checked={settings.autoScan} onChange={(v) => void enableAutoScan(v)}>
                auto-scan every 5 min
              </Toggle>
              <Toggle checked={settings.showHidden} onChange={(v) => set("showHidden", v)}>
                show hidden
              </Toggle>
            </div>
          </div>

          {/* summary + filter */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="font-mono text-xs text-muted" aria-live="polite">
              {result ? (
                <>
                  <span className="text-fg">{visible.length}</span> matches from {result.considered} scanned
                  {newIds.size > 0 && (
                    <>
                      {" · "}
                      <span className="text-cyan">{newIds.size} new</span>
                    </>
                  )}
                  {earlyCount > 0 && (
                    <>
                      {" · "}
                      <span className="text-accent">{earlyCount} apply-early</span>
                    </>
                  )}
                </>
              ) : (
                "No scan yet. Press find gigs."
              )}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Segmented
                label="Sort"
                value={settings.sort}
                onChange={(v) => set("sort", v)}
                options={[
                  { value: "score", label: "best fit" },
                  { value: "newest", label: "newest" },
                ]}
              />
              <label className="relative">
                <span className="sr-only">Filter results</span>
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-dim" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="filter…"
                  className="h-8 w-36 rounded-md border border-line-2 bg-bg/60 pr-2 pl-8 font-mono text-xs text-fg outline-none placeholder:text-dim focus:border-accent/60 sm:w-44"
                />
              </label>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-md border border-danger/40 bg-danger/5 px-3.5 py-2.5 font-mono text-xs text-danger">
              {error}
            </p>
          )}

          {/* results */}
          <div className="mt-4 space-y-3" aria-busy={loading}>
            {loading && !result &&
              Array.from({ length: 4 }, (_, i) => <div key={i} className="h-40 animate-pulse rounded-lg border border-line bg-panel/50" />)}

            {result && visible.length === 0 && !loading && (
              <div className="rounded-lg border border-dashed border-line-2 p-8 text-center">
                <p className="font-mono text-sm text-fg">Nothing matches right now.</p>
                <p className="mt-1.5 text-sm text-muted">Widen the time window, allow more bids, or try the quick searches.</p>
              </div>
            )}

            {visible.map((job: ScoredJob) => (
              <JobCard
                key={job.id}
                job={job}
                now={now}
                isNew={newIds.has(job.id)}
                applied={appliedSet.has(job.id)}
                hidden={hiddenSet.has(job.id)}
                onToggleApplied={onToggleApplied}
                onToggleHidden={onToggleHidden}
                onCopy={onCopy}
              />
            ))}
          </div>
        </section>

        {/* sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:pr-1 scroll-thin">
          <section aria-labelledby="sources-h" className="rounded-lg border border-line-2 bg-panel/60 p-4">
            <h2 id="sources-h" className="mb-3 font-mono text-xs text-dim">
              # sources
            </h2>
            <ul className="space-y-2.5">
              {sources.map((s) => {
                const r = reports.get(s.id);
                const ready = s.state === "ready";
                return (
                  <li key={s.id} className="flex items-start gap-2.5">
                    <input
                      id={`src-${s.id}`}
                      type="checkbox"
                      checked={settings.enabled[s.id] !== false && ready}
                      disabled={!ready}
                      onChange={(e) => set("enabled", { ...settings.enabled, [s.id]: e.target.checked })}
                      className="mt-0.5 size-3.5 cursor-pointer accent-[#3dff8f] disabled:cursor-not-allowed"
                    />
                    <label htmlFor={`src-${s.id}`} className="min-w-0 flex-1 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <span className={cn("rounded border px-1.5 py-px font-mono text-[10.5px]", SOURCE_STYLE[s.id].className)}>{SOURCE_STYLE[s.id].label}</span>
                        {s.hasBids && <span className="font-mono text-[10px] text-dim">bids ✓</span>}
                        {r && (
                          <span
                            title={r.message}
                            className={cn("ml-auto font-mono text-[10.5px] tabular-nums", r.status === "ok" ? "text-muted" : r.status === "error" ? "text-danger" : "text-amber")}
                          >
                            {r.status === "ok" ? `${r.matched}/${r.fetched}` : STATUS_TEXT[r.status]}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-dim">{s.blurb}</span>
                      {r?.status === "error" && r.message && <span className="mt-0.5 block truncate font-mono text-[10.5px] text-danger/80">{r.message}</span>}
                    </label>
                    {s.id === "upwork" && s.state === "needs-connect" && (
                      <a href="/api/radar/upwork/connect" className="shrink-0 rounded border border-accent/40 px-2 py-0.5 font-mono text-[11px] text-accent hover:bg-accent/10">
                        connect
                      </a>
                    )}
                    {s.id === "upwork" && s.state === "ready" && (
                      <form action={disconnectUpwork} className="shrink-0">
                        <button type="submit" className="cursor-pointer font-mono text-[11px] text-dim hover:text-danger">
                          disconnect
                        </button>
                      </form>
                    )}
                    {s.state === "needs-config" && <span className="shrink-0 font-mono text-[11px] text-amber">setup ↓</span>}
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="quick-h" className="rounded-lg border border-line-2 bg-panel/60 p-4">
            <h2 id="quick-h" className="font-mono text-xs text-dim">
              # quick searches
            </h2>
            <p className="mt-1 mb-3 text-xs text-dim">For sites without an API. Opens pre-filtered in your browser.</p>
            <ul className="space-y-1">
              {quickLinks.map((l) => (
                <li key={l.id}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-accent/5">
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[13px] text-fg group-hover:text-accent">{l.label}</span>
                      <span className="block truncate text-[11.5px] text-dim">{l.note}</span>
                    </span>
                    <ArrowUpRight className="size-3.5 shrink-0 text-dim group-hover:text-accent" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <details className="rounded-lg border border-line-2 bg-panel/60 p-4 [&_code]:text-fg">
            <summary className="cursor-pointer font-mono text-xs text-dim">
              # setup: Upwork &amp; X
            </summary>
            <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted">
              <p>
                <span className="text-fg">Upwork:</span> request an API key at{" "}
                <a className="text-cyan underline underline-offset-2" href="https://www.upwork.com/developer/keys/apply" target="_blank" rel="noopener noreferrer">
                  upwork.com/developer/keys/apply
                </a>{" "}
                with read access to marketplace job postings, using this callback URL:
              </p>
              <button
                type="button"
                onClick={async () => toast((await copyToClipboard(upworkCallbackUrl)) ? "✓ callback URL copied" : "Copy failed")}
                className="flex w-full cursor-pointer items-center gap-2 rounded border border-line-2 bg-bg/60 px-2.5 py-2 text-left font-mono text-[11px] break-all text-fg hover:border-accent/50"
              >
                <CopyIcon className="size-3.5 shrink-0 text-dim" />
                {upworkCallbackUrl}
              </button>
              <p>
                Then set <code>UPWORK_CLIENT_ID</code> and <code>UPWORK_CLIENT_SECRET</code> in Vercel, redeploy, and press <span className="text-accent">connect</span>.
              </p>
              <p>
                <span className="text-fg">X:</span> optional. Set <code>X_BEARER_TOKEN</code> (an X API plan with recent search). Without it, use the X quick search.
              </p>
              <p>
                <span className="text-fg">LinkedIn &amp; Toptal</span> have no API for this. Use the quick searches. Automated scraping would put your accounts at risk.
              </p>
            </div>
          </details>
        </aside>
      </main>
    </div>
  );
}
