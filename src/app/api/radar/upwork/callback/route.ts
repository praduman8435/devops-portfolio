import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { isOwner, OAUTH_STATE_COOKIE } from "@/lib/radar/auth";
import { exchangeCode, storeUpworkTokens, upworkRedirectUri } from "@/lib/radar/upwork";

const sameString = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** OAuth redirect target: verifies `state`, exchanges the code, stores encrypted tokens. */
export async function GET(req: NextRequest) {
  const back = (params: Record<string, string>) => {
    const url = new URL("/radar", req.nextUrl.origin);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = NextResponse.redirect(url);
    res.cookies.delete(OAUTH_STATE_COOKIE);
    return res;
  };

  if (!(await isOwner())) return back({});

  const { searchParams } = req.nextUrl;
  const oauthError = searchParams.get("error");
  if (oauthError) return back({ error: `upwork-${oauthError}`.slice(0, 80) });

  const code = searchParams.get("code") ?? "";
  const state = searchParams.get("state") ?? "";
  const expected = req.cookies.get(OAUTH_STATE_COOKIE)?.value ?? "";
  if (!code || !state || !expected || !sameString(state, expected)) return back({ error: "upwork-state-mismatch" });

  try {
    await storeUpworkTokens(await exchangeCode(code, upworkRedirectUri(req.nextUrl.origin)));
    return back({ connected: "upwork" });
  } catch (err) {
    console.error("[radar] Upwork token exchange failed:", err instanceof Error ? err.message : err);
    return back({ error: "upwork-token-exchange-failed" });
  }
}
