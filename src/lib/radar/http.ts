import { RADAR_USER_AGENT } from "./constants";

export class SourceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "SourceError";
  }
}

interface FetchOptions {
  /** Seconds to cache in the Next.js data cache. 0 = never cache (use for authenticated calls). */
  revalidate: number;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  body?: string;
  timeoutMs?: number;
}

async function request(url: string, opts: FetchOptions): Promise<Response> {
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    body: opts.body,
    headers: { "User-Agent": RADAR_USER_AGENT, Accept: "application/json, application/xml;q=0.9, */*;q=0.8", ...opts.headers },
    signal: AbortSignal.timeout(opts.timeoutMs ?? 9_000),
    ...(opts.revalidate > 0 ? { next: { revalidate: opts.revalidate } } : { cache: "no-store" as const }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 200).replace(/\s+/g, " ");
    throw new SourceError(`HTTP ${res.status}${detail ? `: ${detail}` : ""}`, res.status);
  }
  return res;
}

export async function fetchJson<T>(url: string, opts: FetchOptions): Promise<T> {
  return (await request(url, opts)).json() as Promise<T>;
}

export async function fetchText(url: string, opts: FetchOptions): Promise<string> {
  return (await request(url, opts)).text();
}

/** Runs several requests, keeping whatever succeeds. Throws only if every one fails. */
export async function settleAll<T>(tasks: Array<() => Promise<T[]>>): Promise<T[]> {
  const results = await Promise.allSettled(tasks.map((t) => t()));
  const ok = results.filter((r): r is PromiseFulfilledResult<T[]> => r.status === "fulfilled");
  if (ok.length === 0) {
    const first = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
    throw first?.reason instanceof Error ? first.reason : new SourceError("All requests failed");
  }
  return ok.flatMap((r) => r.value);
}
