import "server-only";

import { isUpworkConfigured, isXConfigured, radarEnv } from "./env";
import { fetchJson, fetchText, settleAll, SourceError } from "./http";
import {
  normalizeFreelancer,
  normalizeHn,
  normalizeRemoteOk,
  normalizeRemotive,
  normalizeUpwork,
  normalizeX,
  parseWwrRss,
  type FreelancerProject,
  type HnHit,
  type RemoteOkItem,
  type RemotiveItem,
  type UpworkNode,
  type XSearchResponse,
} from "./normalize";
import { BOOLEAN_QUERY, SEARCH_QUERIES } from "./profile";
import type { Job, SourceId, SourceInfo } from "./types";
import { readUpworkTokens, upworkGraphql } from "./upwork";

export interface FetchContext {
  windowHours: number;
  /** Present only when the Upwork source is ready. */
  upworkToken?: string;
}

type Fetcher = (ctx: FetchContext) => Promise<Job[]>;

const keep = <T>(xs: Array<T | null>): T[] => xs.filter((x): x is T => x !== null);

/* ---------- Upwork ---------- */

export const UPWORK_SEARCH_QUERY = /* GraphQL */ `
  query GigRadarSearch($filter: MarketplaceJobPostingsSearchFilter, $sort: [MarketplaceJobPostingSearchSortAttribute]) {
    marketplaceJobPostingsSearch(marketPlaceJobFilter: $filter, searchType: USER_JOBS_SEARCH, sortAttributes: $sort) {
      edges {
        node {
          id
          ciphertext
          title
          description
          createdDateTime
          publishedDateTime
          experienceLevel
          duration
          durationLabel
          engagement
          amount { rawValue currency displayValue }
          hourlyBudgetMin { rawValue currency displayValue }
          hourlyBudgetMax { rawValue currency displayValue }
          skills { name prettyName }
          totalApplicants
          client {
            totalHires
            totalPostedJobs
            totalSpent { rawValue currency displayValue }
            verificationStatus
            location { country }
            totalReviews
            totalFeedback
          }
        }
      }
    }
  }
`;

const fetchUpwork: Fetcher = async ({ upworkToken }) => {
  if (!upworkToken) throw new SourceError("Not connected");
  const token = upworkToken;
  return settleAll(
    SEARCH_QUERIES.map((q) => async () => {
      const data = await upworkGraphql<{ marketplaceJobPostingsSearch?: { edges?: Array<{ node?: UpworkNode }> } }>(
        token,
        UPWORK_SEARCH_QUERY,
        {
          filter: { searchExpression_eq: q, pagination_eq: { first: 50, after: "0" } },
          sort: [{ field: "RECENCY" }],
        },
      );
      return keep((data.marketplaceJobPostingsSearch?.edges ?? []).map((e) => (e.node ? normalizeUpwork(e.node) : null)));
    }),
  );
};

/* ---------- Freelancer.com (public API, no key) ---------- */

/**
 * Freelancer.com skill ("job") IDs, from /api/projects/0.1/jobs/: DevOps, Kubernetes, Terraform, SRE,
 * CI/CD, AWS, Docker, Ansible, Jenkins, Azure, GCP, Continuous Integration, Prometheus,
 * System Administration, Cloud Security, GitLab. Filtering by skill is far more precise than keyword search.
 */
const FREELANCER_SKILL_IDS = [1678, 1541, 2548, 2549, 2579, 319, 1002, 2153, 1197, 1610, 1184, 1260, 1268, 2689, 1609, 1194];

const fetchFreelancer: Fetcher = async () => {
  const params = new URLSearchParams({ limit: "100", full_description: "true", job_details: "true", compact: "true", sort_field: "submitdate" });
  for (const id of FREELANCER_SKILL_IDS) params.append("jobs[]", String(id));
  const data = await fetchJson<{ result?: { projects?: FreelancerProject[] } }>(
    `https://www.freelancer.com/api/projects/0.1/projects/active/?${params}`,
    { revalidate: 120 },
  );
  return keep((data.result?.projects ?? []).map(normalizeFreelancer));
};

/* ---------- Hacker News "Who is hiring?" (Algolia API) ---------- */

const HN_TERMS = ["devops", "sre", "kubernetes", "terraform", "platform engineer", "infrastructure", "contract"];

const fetchHn: Fetcher = async () => {
  const stories = await fetchJson<{ hits?: Array<{ objectID: string; title?: string }> }>(
    "https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&query=hiring&restrictSearchableAttributes=title&hitsPerPage=5",
    { revalidate: 21_600 },
  );
  const story = stories.hits?.find((h) => /who is hiring/i.test(h.title ?? ""));
  if (!story) throw new SourceError("Couldn't find this month's thread");
  const storyId = Number(story.objectID);
  return settleAll(
    HN_TERMS.map((q) => async () => {
      const data = await fetchJson<{ hits?: HnHit[] }>(
        `https://hn.algolia.com/api/v1/search?tags=comment,story_${storyId}&query=${encodeURIComponent(q)}&hitsPerPage=60`,
        { revalidate: 1_800 },
      );
      return keep((data.hits ?? []).map((h) => normalizeHn(h, storyId))).filter((j) => j.engagement !== "full-time" && j.engagement !== "unknown");
    }),
  );
};

/* ---------- Remote OK (public API; attribution required: every job links back) ---------- */

const fetchRemoteOk: Fetcher = () =>
  settleAll(
    ["devops", "sysadmin"].map((tag) => async () => {
      const data = await fetchJson<RemoteOkItem[]>(`https://remoteok.com/api?tag=${tag}`, { revalidate: 3_600 });
      return keep(data.slice(1).map(normalizeRemoteOk)); // item 0 is the legal notice
    }),
  );

/* ---------- Remotive (public API; ≤ 4 requests/day, hence the 6h cache) ---------- */

const fetchRemotive: Fetcher = async () => {
  const data = await fetchJson<{ jobs?: RemotiveItem[] }>("https://remotive.com/api/remote-jobs?category=devops", {
    revalidate: 21_600,
  });
  return keep((data.jobs ?? []).map(normalizeRemotive));
};

/* ---------- We Work Remotely (DevOps & Sysadmin RSS) ---------- */

const fetchWwr: Fetcher = async () => {
  const rss = await fetchText("https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss", { revalidate: 1_800 });
  return parseWwrRss(rss);
};

/* ---------- X / Twitter (API v2 recent search; paid, optional) ---------- */

const fetchX: Fetcher = async ({ windowHours }) => {
  // Recent search covers the last 7 days.
  const start = new Date(Date.now() - Math.min(windowHours, 167) * 3_600_000).toISOString();
  const query = `${BOOLEAN_QUERY} (hiring OR "looking for" OR contract OR freelance OR freelancer) -is:retweet -is:reply lang:en`;
  const params = new URLSearchParams({
    query,
    max_results: "50",
    start_time: start,
    "tweet.fields": "created_at,public_metrics,author_id",
    expansions: "author_id",
    "user.fields": "username,name",
  });
  const data = await fetchJson<XSearchResponse>(`https://api.x.com/2/tweets/search/recent?${params}`, {
    revalidate: 0,
    headers: { Authorization: `Bearer ${radarEnv.xBearerToken}` },
  });
  return normalizeX(data);
};

/* ---------- registry ---------- */

interface SourceDef extends Omit<SourceInfo, "state"> {
  fetch: Fetcher;
}

export const SOURCES: Record<SourceId, SourceDef> = {
  upwork: { id: "upwork", name: "Upwork", blurb: "Official API · proposals & client stats", hasBids: true, home: "https://www.upwork.com", fetch: fetchUpwork },
  freelancer: { id: "freelancer", name: "Freelancer.com", blurb: "Official API · live bid counts", hasBids: true, home: "https://www.freelancer.com", fetch: fetchFreelancer },
  hn: { id: "hn", name: "HN Who is hiring", blurb: "Monthly thread · direct to founders", hasBids: false, home: "https://news.ycombinator.com", fetch: fetchHn },
  remoteok: { id: "remoteok", name: "Remote OK", blurb: "Remote DevOps & sysadmin roles", hasBids: false, home: "https://remoteok.com", fetch: fetchRemoteOk },
  wwr: { id: "wwr", name: "We Work Remotely", blurb: "DevOps & sysadmin category feed", hasBids: false, home: "https://weworkremotely.com", fetch: fetchWwr },
  remotive: { id: "remotive", name: "Remotive", blurb: "Remote DevOps · 24h delayed feed", hasBids: false, home: "https://remotive.com", fetch: fetchRemotive },
  x: { id: "x", name: "X / Twitter", blurb: "Hiring posts · needs a paid API token", hasBids: false, home: "https://x.com", fetch: fetchX },
};

/** Per-request readiness of every source (reads env and the Upwork token cookie). */
export async function getSourceInfos(): Promise<SourceInfo[]> {
  const upworkConnected = isUpworkConfigured() && (await readUpworkTokens()) !== null;
  return Object.values(SOURCES).map((def) => ({
    id: def.id,
    name: def.name,
    blurb: def.blurb,
    hasBids: def.hasBids,
    home: def.home,
    state:
      def.id === "upwork"
        ? !isUpworkConfigured()
          ? "needs-config"
          : upworkConnected
            ? "ready"
            : "needs-connect"
        : def.id === "x" && !isXConfigured()
          ? "needs-config"
          : "ready",
  }));
}
