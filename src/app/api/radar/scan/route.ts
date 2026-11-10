import { NextResponse, type NextRequest } from "next/server";

import { isOwner } from "@/lib/radar/auth";
import { rankJobs } from "@/lib/radar/score";
import { getSourceInfos, SOURCES } from "@/lib/radar/sources";
import { SOURCE_IDS, type Job, type ScanOptions, type ScanResult, type SourceId, type SourceReport } from "@/lib/radar/types";
import { getUpworkAccessToken } from "@/lib/radar/upwork";

export const maxDuration = 30;

const noStore = { "Cache-Control": "no-store" };

function parseOptions(body: unknown): ScanOptions | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const sources = Array.isArray(b.sources) ? b.sources.filter((s): s is SourceId => SOURCE_IDS.includes(s as SourceId)) : [];
  const windowHours = Number(b.windowHours);
  const maxBids = b.maxBids === null ? null : Number(b.maxBids);
  if (!sources.length || !Number.isFinite(windowHours) || windowHours <= 0 || windowHours > 24 * 30) return null;
  if (maxBids !== null && (!Number.isFinite(maxBids) || maxBids < 1)) return null;
  return {
    sources: [...new Set(sources)],
    windowHours,
    maxBids,
    requireKnownBids: b.requireKnownBids === true,
    contractOnly: b.contractOnly !== false,
  };
}

export async function POST(req: NextRequest) {
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });

  const opts = parseOptions(await req.json().catch(() => null));
  if (!opts) return NextResponse.json({ error: "Invalid scan options" }, { status: 400, headers: noStore });

  const infos = new Map((await getSourceInfos()).map((s) => [s.id, s]));
  const upworkToken = opts.sources.includes("upwork") && infos.get("upwork")?.state === "ready" ? await getUpworkAccessToken() : null;

  const reports: SourceReport[] = [];
  const all: Job[] = [];

  await Promise.all(
    opts.sources.map(async (id) => {
      const info = infos.get(id);
      if (info?.state === "needs-config") return reports.push({ id, status: "not-configured", fetched: 0, matched: 0 });
      if (id === "upwork" && !upworkToken) return reports.push({ id, status: "not-connected", fetched: 0, matched: 0 });

      const started = Date.now();
      try {
        const jobs = await SOURCES[id].fetch({ windowHours: opts.windowHours, upworkToken: upworkToken ?? undefined });
        all.push(...jobs);
        reports.push({ id, status: "ok", fetched: jobs.length, matched: 0, ms: Date.now() - started });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        reports.push({ id, status: "error", fetched: 0, matched: 0, ms: Date.now() - started, message: message.slice(0, 240) });
      }
    }),
  );

  const jobs = rankJobs(all, opts);
  for (const r of reports) r.matched = jobs.filter((j) => j.source === r.id).length;
  reports.sort((a, b) => SOURCE_IDS.indexOf(a.id) - SOURCE_IDS.indexOf(b.id));

  const result: ScanResult = { scannedAt: new Date().toISOString(), jobs, sources: reports, considered: all.length };
  return NextResponse.json(result, { headers: noStore });
}
