/**
 * Single source of truth for identity, links and navigation.
 * Edit here, and every component, the terminal, the command palette and the SEO metadata update together.
 */

export const site = {
  name: "Praduman Prajapati",
  handle: "praduman",
  role: "DevOps Engineer",
  tagline: "Freelance DevOps Engineer · AWS, Kubernetes, Terraform",
  description:
    "Freelance DevOps engineer with 3+ years of production experience. I build CI/CD pipelines, production Kubernetes on AWS EKS, Terraform infrastructure and DevSecOps workflows, and I ship full-stack products too.",
  email: "praduman.cnd@gmail.com",
  location: "India",
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST (UTC+5:30)",
  yearsExperience: 3,
  articles: 22,
  repoName: "devops-portfolio",
  /** Set to true after making the GitHub repo public, so "view source" links stop returning a 404 for visitors. */
  sourceIsPublic: true,
  links: {
    github: "https://github.com/praduman8435",
    linkedin: "https://www.linkedin.com/in/praduman-prajapati/",
    x: "https://x.com/CndTwtprad",
    blog: "https://itspraduman.hashnode.dev/",
    coffee: "https://buymeacoffee.com/praduman",
    source: "https://github.com/praduman8435/devops-portfolio",
  },
  handles: {
    github: "@praduman8435",
    linkedin: "in/praduman-prajapati",
    x: "@CndTwtprad",
    blog: "itspraduman.hashnode.dev",
  },
} as const;

/** Resolves the canonical URL on Vercel, in local dev, or from an explicit override. */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export type SectionId = "about" | "services" | "process" | "work" | "products" | "stack" | "writing" | "contact";

export const sections: ReadonlyArray<{ id: SectionId; label: string; index: string; inNav: boolean }> = [
  { id: "about", label: "about", index: "01", inNav: true },
  { id: "services", label: "services", index: "02", inNav: true },
  { id: "process", label: "process", index: "03", inNav: false },
  { id: "work", label: "work", index: "04", inNav: true },
  { id: "products", label: "products", index: "05", inNav: true },
  { id: "stack", label: "stack", index: "06", inNav: true },
  { id: "writing", label: "writing", index: "07", inNav: true },
  { id: "contact", label: "contact", index: "08", inNav: false },
];

export const sectionIndex = (id: SectionId): string => sections.find((s) => s.id === id)?.index ?? "";
