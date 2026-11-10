import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { cookieBase, isOwner, OAUTH_STATE_COOKIE } from "@/lib/radar/auth";
import { isUpworkConfigured } from "@/lib/radar/env";
import { buildAuthorizeUrl, upworkRedirectUri } from "@/lib/radar/upwork";

/** Starts the Upwork OAuth flow with a CSRF `state` bound to this browser. */
export async function GET(req: NextRequest) {
  const radar = new URL("/radar", req.nextUrl.origin);
  if (!(await isOwner())) return NextResponse.redirect(radar);
  if (!isUpworkConfigured()) {
    radar.searchParams.set("error", "upwork-not-configured");
    return NextResponse.redirect(radar);
  }

  const state = randomBytes(24).toString("base64url");
  const res = NextResponse.redirect(buildAuthorizeUrl(state, upworkRedirectUri(req.nextUrl.origin)));
  res.cookies.set(OAUTH_STATE_COOKIE, state, { ...cookieBase, maxAge: 600 });
  return res;
}
