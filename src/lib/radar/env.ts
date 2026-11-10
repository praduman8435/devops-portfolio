import "server-only";

/**
 * Typed access to Gig Radar's secrets. `server-only` makes any accidental import from a
 * client component a build error, so these values can never be shipped to the browser.
 */
export const radarEnv = {
  /** Passphrase for /radar. Radar is disabled entirely when unset. */
  password: process.env.RADAR_PASSWORD ?? "",
  /** ≥ 32 chars. Signs the session cookie and encrypts stored OAuth tokens. */
  secret: process.env.RADAR_SECRET ?? "",
  upwork: {
    clientId: process.env.UPWORK_CLIENT_ID ?? "",
    clientSecret: process.env.UPWORK_CLIENT_SECRET ?? "",
    /** Must exactly match the callback URL registered with the Upwork API key. */
    redirectUri: process.env.UPWORK_REDIRECT_URI ?? "",
  },
  /** X API v2 bearer token (paid API). Optional. */
  xBearerToken: process.env.X_BEARER_TOKEN ?? "",
} as const;

export const isRadarConfigured = () => radarEnv.password.length >= 8 && radarEnv.secret.length >= 32;
export const isUpworkConfigured = () => Boolean(radarEnv.upwork.clientId && radarEnv.upwork.clientSecret);
export const isXConfigured = () => Boolean(radarEnv.xBearerToken);
