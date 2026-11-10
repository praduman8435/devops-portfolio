/**
 * Your search profile: the single place to tune what Gig Radar treats as relevant.
 * Weights: 3 = core to the profile, 2 = strong signal, 1 = supporting signal.
 * Matching is case-insensitive and whole-word, so "sre" won't match "pressure".
 */

export interface Keyword {
  term: string;
  weight: 1 | 2 | 3;
  /** Optional custom pattern for terms with punctuation or variants. */
  pattern?: RegExp;
}

export const KEYWORDS: Keyword[] = [
  // core: the work itself
  { term: "devops", weight: 3, pattern: /\bdev[\s-]?ops\b/i },
  { term: "sre", weight: 3, pattern: /\bsres?\b/i },
  { term: "site reliability", weight: 3 },
  { term: "platform engineering", weight: 3, pattern: /\bplatform\s+engineer(s|ing)?\b/i },
  { term: "infrastructure", weight: 3, pattern: /\binfrastructure\b|\binfra\b/i },
  { term: "kubernetes", weight: 3, pattern: /\bkubernetes\b|\bk8s\b/i },
  { term: "terraform", weight: 3 },
  { term: "eks", weight: 3 },
  { term: "gke", weight: 3 },
  { term: "aks", weight: 3 },
  { term: "helm", weight: 3 },
  { term: "argocd", weight: 3, pattern: /\bargo\s?cd\b/i },
  { term: "gitops", weight: 3 },
  { term: "ci/cd", weight: 3, pattern: /\bci\s?\/\s?cd\b|\bcicd\b/i },
  { term: "devsecops", weight: 3 },
  { term: "infrastructure as code", weight: 3, pattern: /\binfrastructure[\s-]as[\s-]code\b|\biac\b/i },
  { term: "openshift", weight: 3 },

  // strong: the stack around it
  { term: "aws", weight: 2, pattern: /\baws\b|\bamazon web services\b/i },
  { term: "azure", weight: 2 },
  { term: "gcp", weight: 2, pattern: /\bgcp\b|\bgoogle cloud\b/i },
  { term: "cloud engineer", weight: 2, pattern: /\bcloud\s+(engineers?|architects?|infrastructure|migrations?|ops)\b/i },
  { term: "docker", weight: 2 },
  { term: "ansible", weight: 2 },
  { term: "jenkins", weight: 2 },
  { term: "github actions", weight: 2 },
  { term: "gitlab ci", weight: 2, pattern: /\bgitlab[\s-]?ci\b/i },
  { term: "prometheus", weight: 2 },
  { term: "grafana", weight: 2 },
  { term: "observability", weight: 2 },
  { term: "monitoring", weight: 2 },
  { term: "datadog", weight: 2 },
  { term: "opentelemetry", weight: 2 },
  { term: "cloudformation", weight: 2 },
  { term: "pulumi", weight: 2 },
  { term: "linux", weight: 2 },
  { term: "sysadmin", weight: 2, pattern: /\bsys\s?admins?\b|\bsystems? administrat(or|ors|ion)\b|\blinux admin(istrator)?s?\b/i },
  { term: "ecs", weight: 2 },
  { term: "fargate", weight: 2 },
  { term: "serverless", weight: 2 },
  { term: "istio", weight: 2, pattern: /\bistio\b|\bservice mesh\b/i },
  { term: "vault", weight: 2 },
  { term: "sonarqube", weight: 2 },
  { term: "trivy", weight: 2 },
  { term: "finops", weight: 2, pattern: /\bfinops\b|\bcost optimi[sz]ation\b/i },
  { term: "high availability", weight: 2, pattern: /\bhigh availability\b|\bdisaster recovery\b/i },
  { term: "nginx", weight: 2 },

  // supporting
  { term: "python", weight: 1 },
  { term: "golang", weight: 1 },
  { term: "bash", weight: 1, pattern: /\bbash\b|\bshell script(ing)?\b/i },
  { term: "pipeline", weight: 1, pattern: /\bpipelines?\b/i },
  { term: "automation", weight: 1 },
  { term: "deployment", weight: 1, pattern: /\bdeploy(ment|ments|ing)?\b/i },
  { term: "microservices", weight: 1 },
  { term: "security", weight: 1 },
];

/** Work outside the profile. In a title it disqualifies the job; elsewhere it lowers relevance. */
export const NEGATIVE_KEYWORDS: string[] = [
  "wordpress",
  "shopify",
  "wix",
  "squarespace",
  "webflow",
  "seo",
  "logo",
  "graphic design",
  "video editing",
  "data entry",
  "virtual assistant",
  "copywriting",
  "translation",
  "bookkeeping",
  "social media",
  "lead generation",
  "cold calling",
  "appointment setting",
  "bench sales",
  "recruiter",
  "staffing",
  "unity",
  "game development",
  "flutter",
  "react native",
];

/** Queries sent to sources that take a search term (each one is a separate request). */
export const SEARCH_QUERIES: string[] = [
  "devops",
  "kubernetes",
  "terraform",
  "site reliability",
  "platform engineer",
  "aws infrastructure",
  "ci/cd pipeline",
];

/** The single compound query for sources that take one boolean query (X, LinkedIn links). */
export const BOOLEAN_QUERY =
  '(devops OR sre OR "site reliability" OR "platform engineer" OR kubernetes OR terraform OR "infrastructure engineer")';
