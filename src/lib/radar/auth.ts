import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { EncryptJWT, SignJWT, jwtDecrypt, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

import { isRadarConfigured, radarEnv } from "./env";

/* ------------------------------------------------------------------ *
 * Owner-only access for /radar.
 * - Session: HS256-signed JWT in an HttpOnly, Secure, SameSite=Lax cookie.
 * - OAuth tokens: encrypted (A256GCM JWE) in their own HttpOnly cookie, so no database is needed.
 * Keys are derived per purpose from RADAR_SECRET.
 * ------------------------------------------------------------------ */

export const SESSION_COOKIE = "radar_session";
export const UPWORK_COOKIE = "radar_upwork";
export const OAUTH_STATE_COOKIE = "radar_oauth_state";

const SESSION_TTL_S = 60 * 60 * 24 * 30; // 30 days
const isProd = process.env.NODE_ENV === "production";

const deriveKey = (purpose: string) => new Uint8Array(createHash("sha256").update(`${purpose}:${radarEnv.secret}`).digest());

export const cookieBase = { httpOnly: true, secure: isProd, sameSite: "lax", path: "/" } as const;

/* ---------- password check with brute-force throttling ---------- */

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 8;

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Constant-time password comparison (hash both sides so lengths always match), with per-IP throttling.
 * Throttling is best-effort per serverless instance. The real defence is a long random passphrase.
 */
export async function verifyPassword(input: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isRadarConfigured()) return { ok: false, reason: "Radar is not configured on this deployment." };

  const ip = await clientIp();
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.first < WINDOW_MS && rec.count >= MAX_ATTEMPTS) {
    return { ok: false, reason: "Too many attempts. Try again in 15 minutes." };
  }

  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(radarEnv.password).digest();
  if (timingSafeEqual(a, b)) {
    attempts.delete(ip);
    return { ok: true };
  }

  if (!rec || now - rec.first >= WINDOW_MS) attempts.set(ip, { count: 1, first: now });
  else rec.count += 1;
  await new Promise((r) => setTimeout(r, 600)); // slow down guessing
  return { ok: false, reason: "Wrong passphrase." };
}

/* ---------- session ---------- */

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("owner")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_S}s`)
    .sign(deriveKey("radar-session"));
  (await cookies()).set(SESSION_COOKIE, token, { ...cookieBase, maxAge: SESSION_TTL_S });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(UPWORK_COOKIE);
}

/** True only for a valid, unexpired owner session. Fails closed when radar isn't configured. */
export async function isOwner(): Promise<boolean> {
  if (!isRadarConfigured()) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, deriveKey("radar-session"), { algorithms: ["HS256"] });
    return payload.sub === "owner" && payload.role === "owner";
  } catch {
    return false;
  }
}

/* ---------- encrypted token storage ---------- */

export async function sealJson(data: Record<string, unknown>, ttlSeconds: number): Promise<string> {
  return new EncryptJWT(data)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .encrypt(deriveKey("radar-tokens"));
}

export async function unsealJson<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtDecrypt(token, deriveKey("radar-tokens"));
    return payload as T;
  } catch {
    return null;
  }
}
