import { describe, expect, it } from "vitest";

import { formatAgo, formatBudget } from "./format";
import { normalizeFreelancer, normalizeHn, normalizeRemotive, normalizeUpwork, parseWwrRss, upworkJobUrl } from "./normalize";
import { detectEngagement, htmlToText } from "./text";

describe("text helpers", () => {
  it("strips HTML into readable text", () => {
    expect(htmlToText("<p>Hello&nbsp;<b>DevOps</b></p><ul><li>K8s</li><li>Terraform &amp; AWS</li></ul>")).toBe("Hello DevOps\n• K8s\n• Terraform & AWS");
  });

  it("detects engagement types", () => {
    expect(detectEngagement("Seeking a freelance SRE")).toBe("freelance");
    expect(detectEngagement("6-month contract, C2C ok")).toBe("contract");
    expect(detectEngagement("Full-time, permanent role")).toBe("full-time");
    expect(detectEngagement("DevOps engineer")).toBe("unknown");
  });
});

describe("normalizers (shapes taken from live responses)", () => {
  it("Freelancer.com project", () => {
    const j = normalizeFreelancer({
      id: 40811186,
      title: "Kubernetes help",
      seo_url: "devops/kubernetes-help",
      description: "Fix our EKS cluster",
      type: "hourly",
      time_submitted: 1794287181,
      currency: { code: "USD" },
      budget: { minimum: 30, maximum: 50 },
      bid_stats: { bid_count: 3 },
      jobs: [{ name: "Kubernetes" }, { name: "Amazon Web Services" }],
    });
    expect(j).toMatchObject({
      id: "freelancer:40811186",
      url: "https://www.freelancer.com/projects/devops/kubernetes-help",
      bids: 3,
      budget: { kind: "hourly", min: 30, max: 50, currency: "USD" },
      skills: ["Kubernetes", "Amazon Web Services"],
    });
    expect(formatBudget(j!.budget)).toBe("$30–$50/hr");
  });

  it("Freelancer.com hides bids when the client hides them", () => {
    expect(normalizeFreelancer({ id: 1, title: "x", hidebids: true, bid_stats: { bid_count: 9 } })?.bids).toBeNull();
  });

  it("Upwork node, including client trust signals and job URL", () => {
    const j = normalizeUpwork({
      id: "1234",
      ciphertext: "~01abc",
      title: "Terraform modules for AWS",
      description: "<p>Need IaC</p>",
      publishedDateTime: "2026-11-10T10:00:00Z",
      experienceLevel: "EXPERT",
      amount: { rawValue: "1500.0", currency: "USD" },
      totalApplicants: 2,
      skills: [{ prettyName: "Terraform" }],
      client: { verificationStatus: "VERIFIED", totalSpent: { rawValue: "25000" }, totalHires: 14, totalFeedback: 4.9, totalReviews: 11, location: { country: "United States" } },
    });
    expect(j).toMatchObject({
      url: "https://www.upwork.com/jobs/~01abc",
      bids: 2,
      budget: { kind: "fixed", min: 1500 },
      experienceLevel: "Expert",
      client: { paymentVerified: true, totalSpent: 25000, hires: 14, rating: 4.9, country: "United States" },
    });
    expect(upworkJobUrl("01abc", "x")).toBe("https://www.upwork.com/jobs/~01abc");
  });

  it("HN keeps only top-level posts", () => {
    const hit = { objectID: "9", parent_id: 100, created_at: "2026-11-09T13:57:09Z", comment_text: "Acme | Platform Engineer | REMOTE | Contract<p>We run k8s" };
    expect(normalizeHn(hit, 100)).toMatchObject({ company: "Acme", engagement: "contract", location: "Remote", url: "https://news.ycombinator.com/item?id=9" });
    expect(normalizeHn({ ...hit, parent_id: 55 }, 100)).toBeNull();
  });

  it("Remotive treats zone-less dates as UTC and maps job_type", () => {
    const j = normalizeRemotive({ id: 1, url: "https://remotive.com/x", title: "SRE", job_type: "contract", publication_date: "2026-11-08T21:47:58" });
    expect(j?.postedAt).toBe("2026-11-08T21:47:58.000Z");
    expect(j?.engagement).toBe("contract");
  });

  it("We Work Remotely RSS item", () => {
    const rss = `<?xml version="1.0"?><rss><channel><item>
      <title>Acme Corp: Senior DevOps Engineer</title><link>https://weworkremotely.com/remote-jobs/acme-devops</link>
      <pubDate>Mon, 09 Nov 2026 10:00:00 +0000</pubDate><type>Contract</type><skills>AWS, Kubernetes, and Terraform</skills>
      <region>Anywhere in the World</region><description>&lt;p&gt;Run our &lt;b&gt;EKS&lt;/b&gt; fleet&lt;/p&gt;</description></item></channel></rss>`;
    const [j] = parseWwrRss(rss);
    expect(j).toMatchObject({ company: "Acme Corp", title: "Senior DevOps Engineer", engagement: "contract", skills: ["AWS", "Kubernetes", "Terraform"], description: "Run our EKS fleet" });
  });
});

describe("format", () => {
  it("relative times", () => {
    const now = Date.parse("2026-11-10T12:00:00Z");
    expect(formatAgo("2026-11-10T11:46:00Z", now)).toBe("14m ago");
    expect(formatAgo("2026-11-10T09:00:00Z", now)).toBe("3h ago");
    expect(formatAgo("2026-11-07T12:00:00Z", now)).toBe("3d ago");
  });
});
