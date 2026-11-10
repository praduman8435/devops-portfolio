import "server-only";

import { cookies } from "next/headers";

import { UPWORK_COOKIE, cookieBase, sealJson, unsealJson } from "./auth";
import { radarEnv } from "./env";
import { SourceError } from "./http";

/* ------------------------------------------------------------------ *
 * Upwork official API: OAuth 2.0 (authorization code) + GraphQL.
 * Endpoints are taken from Upwork's own SDKs (github.com/upwork/*-upwork-oauth2).
 * ------------------------------------------------------------------ */

const AUTHORIZE_URL = "https://www.upwork.com/ab/account-security/oauth2/authorize";
const TOKEN_URL = "https://www.upwork.com/api/v3/oauth2/token";
export const UPWORK_GRAPHQL_URL = "https://api.upwork.com/graphql";

/** How long we keep the encrypted tokens cookie; a failed refresh simply asks you to reconnect. */
const TOKEN_COOKIE_TTL_S = 60 * 60 * 24 * 30;

export interface UpworkTokens {
  accessToken: string;
  refreshToken: string;
  /** epoch ms */
  expiresAt: number;
}

export const upworkRedirectUri = (origin: string) => radarEnv.upwork.redirectUri || `${origin}/api/radar/upwork/callback`;

export function buildAuthorizeUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: radarEnv.upwork.clientId,
    redirect_uri: redirectUri,
    state,
  });
  return `${AUTHORIZE_URL}?${params}`;
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number | string;
  error?: string;
  error_description?: string;
}

/** Client credentials go in the form body, matching Upwork's Node SDK (authorizationMethod: 'body'). */
async function tokenRequest(params: Record<string, string>, previousRefresh?: string): Promise<UpworkTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      ...params,
      client_id: radarEnv.upwork.clientId,
      client_secret: radarEnv.upwork.clientSecret,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await res.json().catch(() => ({}))) as TokenResponse;
  if (!res.ok || !data.access_token) {
    throw new SourceError(data.error_description || data.error || `Token request failed (HTTP ${res.status})`, res.status);
  }
  const expiresIn = Number(data.expires_in ?? 86_400);
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? previousRefresh ?? "",
    expiresAt: Date.now() + (Number.isFinite(expiresIn) ? expiresIn : 86_400) * 1000,
  };
}

export const exchangeCode = (code: string, redirectUri: string) =>
  tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri });

const refreshTokens = (refreshToken: string) => tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken }, refreshToken);

export async function storeUpworkTokens(tokens: UpworkTokens): Promise<void> {
  const sealed = await sealJson({ ...tokens }, TOKEN_COOKIE_TTL_S);
  (await cookies()).set(UPWORK_COOKIE, sealed, { ...cookieBase, maxAge: TOKEN_COOKIE_TTL_S });
}

export async function readUpworkTokens(): Promise<UpworkTokens | null> {
  const raw = (await cookies()).get(UPWORK_COOKIE)?.value;
  const t = await unsealJson<UpworkTokens>(raw);
  return t?.accessToken ? t : null;
}

export async function clearUpworkTokens(): Promise<void> {
  (await cookies()).delete(UPWORK_COOKIE);
}

/** Returns a usable access token, transparently refreshing (and re-storing) it when close to expiry. */
export async function getUpworkAccessToken(): Promise<string | null> {
  const tokens = await readUpworkTokens();
  if (!tokens) return null;
  if (tokens.expiresAt - Date.now() > 60_000) return tokens.accessToken;
  if (!tokens.refreshToken) return null;
  try {
    const fresh = await refreshTokens(tokens.refreshToken);
    await storeUpworkTokens(fresh);
    return fresh.accessToken;
  } catch {
    await clearUpworkTokens();
    return null;
  }
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function upworkGraphql<T>(accessToken: string, query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(UPWORK_GRAPHQL_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (res.status === 401 || res.status === 403) throw new SourceError("Upwork rejected the token. Reconnect Upwork.", res.status);
  const body = (await res.json().catch(() => ({}))) as GraphqlResponse<T>;
  if (body.errors?.length) throw new SourceError(body.errors.map((e) => e.message).join("; ").slice(0, 300), res.status);
  if (!res.ok || !body.data) throw new SourceError(`Upwork GraphQL HTTP ${res.status}`, res.status);
  return body.data;
}
