import { BOOLEAN_QUERY } from "./profile";

/**
 * One-click searches for sites with no usable API (or whose terms forbid automated access).
 * They open in your own logged-in browser, already filtered and sorted newest-first.
 */
export interface QuickLink {
  id: string;
  label: string;
  note: string;
  href: string;
}

export function buildQuickLinks(windowHours: number): QuickLink[] {
  const seconds = Math.max(3_600, Math.round(windowHours * 3_600));
  const enc = encodeURIComponent;
  const xQuery = `${BOOLEAN_QUERY} (hiring OR "looking for" OR contract OR freelance) -is:retweet lang:en`;
  const liPostsQuery = '(hiring OR "looking for") (devops OR sre OR "platform engineer" OR kubernetes OR terraform) (contract OR freelance)';
  const liDate = windowHours <= 24 ? '"past-24h"' : windowHours <= 168 ? '"past-week"' : '"past-month"';

  return [
    {
      id: "linkedin-jobs",
      label: "LinkedIn Jobs",
      note: "Contract · remote · newest first",
      href: `https://www.linkedin.com/jobs/search/?keywords=${enc(BOOLEAN_QUERY)}&f_JT=C%2CP&f_WT=2&f_TPR=r${seconds}&sortBy=DD`,
    },
    {
      id: "linkedin-posts",
      label: "LinkedIn posts",
      note: "People posting contract DevOps work",
      href: `https://www.linkedin.com/search/results/content/?keywords=${enc(liPostsQuery)}&datePosted=${enc(liDate)}&sortBy=${enc('"date_posted"')}`,
    },
    {
      id: "x-live",
      label: "X live search",
      note: "Latest hiring posts (no API token needed)",
      href: `https://x.com/search?q=${enc(xQuery)}&f=live`,
    },
    {
      id: "upwork-search",
      label: "Upwork search",
      note: "Same profile, newest first, on the site",
      href: `https://www.upwork.com/nx/search/jobs/?q=${enc('devops OR kubernetes OR terraform OR "site reliability" OR "platform engineer"')}&sort=recency&proposals=0-4`,
    },
    {
      id: "toptal",
      label: "Toptal",
      note: "Matched engagements live in your talent portal",
      href: "https://www.toptal.com/users/login",
    },
    {
      id: "contra",
      label: "Contra",
      note: "Commission-free freelance projects",
      href: "https://contra.com/",
    },
    {
      id: "peopleperhour",
      label: "PeoplePerHour",
      note: "DevOps projects",
      href: "https://www.peopleperhour.com/freelance-jobs?q=devops",
    },
    {
      id: "guru",
      label: "Guru",
      note: "DevOps jobs",
      href: "https://www.guru.com/d/jobs/q/devops/",
    },
    {
      id: "wellfound",
      label: "Wellfound",
      note: "Startup DevOps roles",
      href: "https://wellfound.com/role/r/devops-engineer",
    },
  ];
}
