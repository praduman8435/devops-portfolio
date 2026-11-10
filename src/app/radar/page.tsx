import { isOwner } from "@/lib/radar/auth";
import { isRadarConfigured } from "@/lib/radar/env";
import { getSourceInfos } from "@/lib/radar/sources";
import { upworkRedirectUri } from "@/lib/radar/upwork";
import { getSiteUrl } from "@/content/site";
import { LoginForm } from "@/components/radar/login-form";
import { RadarAppLoader } from "@/components/radar/radar-app-loader";

export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  "connected:upwork": "Upwork connected. Your next scan includes it.",
  "error:upwork-not-configured": "Add UPWORK_CLIENT_ID and UPWORK_CLIENT_SECRET to the deployment first.",
  "error:upwork-state-mismatch": "Upwork sign-in expired or was tampered with. Try connecting again.",
  "error:upwork-token-exchange-failed": "Upwork rejected the sign-in. Check the client ID, secret and callback URL.",
  "error:upwork-access_denied": "Upwork access was declined.",
};

export default async function RadarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!isRadarConfigured()) {
    return (
      <main className="container-page flex min-h-svh items-center justify-center">
        <p className="font-mono text-sm text-muted">404 · not found</p>
      </main>
    );
  }

  if (!(await isOwner())) return <LoginForm />;

  const sp = await searchParams;
  const key = typeof sp.connected === "string" ? `connected:${sp.connected}` : typeof sp.error === "string" ? `error:${sp.error}` : "";
  const notice = key ? { tone: key.startsWith("error") ? ("error" as const) : ("ok" as const), text: NOTICES[key] ?? key } : null;

  return (
    <RadarAppLoader
      sources={await getSourceInfos()}
      notice={notice}
      upworkCallbackUrl={upworkRedirectUri(getSiteUrl())}
    />
  );
}
