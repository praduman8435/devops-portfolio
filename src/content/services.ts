export type ServiceIcon = "pipeline" | "cluster" | "layers" | "shield" | "pulse" | "trend";

export interface Service {
  id: string;
  icon: ServiceIcon;
  title: string;
  tagline: string;
  points: string[];
  outcome: string;
  tools: string[];
}

export const services: Service[] = [
  {
    id: "cicd",
    icon: "pipeline",
    title: "CI/CD Pipelines",
    tagline: "Every commit built, tested, scanned and deployed automatically.",
    points: [
      "Jenkins, GitHub Actions or GitLab CI, designed around your workflow",
      "Quality and security gates before anything reaches production",
      "Promotion from dev to staging to prod, with fast rollbacks",
    ],
    outcome: "Releases in minutes, not afternoons.",
    tools: ["jenkins", "github-actions", "gitlab-ci", "docker"],
  },
  {
    id: "kubernetes",
    icon: "cluster",
    title: "Kubernetes & AWS EKS",
    tagline: "Production clusters that scale, self-heal and stay boring.",
    points: [
      "EKS architecture, provisioning and version upgrades",
      "Helm charts, ingress, TLS and autoscaling",
      "GitOps delivery with ArgoCD, so git defines what's running",
    ],
    outcome: "Calm deploys and predictable capacity.",
    tools: ["eks", "helm", "argocd", "ingress"],
  },
  {
    id: "iac",
    icon: "layers",
    title: "Infrastructure as Code",
    tagline: "Your whole cloud, reviewed and reproducible.",
    points: [
      "Modular Terraform for VPC, IAM, EKS, EC2 and networking",
      "Remote state, locking and plan-on-pull-request workflows",
      "Configuration management with Ansible",
    ],
    outcome: "A new environment with one command.",
    tools: ["terraform", "ansible", "aws"],
  },
  {
    id: "devsecops",
    icon: "shield",
    title: "DevSecOps",
    tagline: "Security that ships with every commit, not after an incident.",
    points: [
      "Static analysis and quality gates with SonarQube",
      "Container image and dependency scanning with Trivy",
      "Least-privilege IAM and Kubernetes RBAC",
    ],
    outcome: "Vulnerabilities caught in CI, not in production.",
    tools: ["sonarqube", "trivy", "rbac", "iam"],
  },
  {
    id: "observability",
    icon: "pulse",
    title: "Monitoring & Observability",
    tagline: "See problems before your users do.",
    points: [
      "Prometheus metrics and alerting rules that mean something",
      "Grafana dashboards for apps and clusters",
      "Runbooks your on-call engineer can actually follow",
    ],
    outcome: "Faster incident response and fewer 2 a.m. surprises.",
    tools: ["prometheus", "grafana"],
  },
  {
    id: "cost",
    icon: "trend",
    title: "Cloud Cost & Migration",
    tagline: "Lower AWS bills and modern deployments.",
    points: [
      "Cost audit, right-sizing and cleanup of idle resources",
      "Containerising legacy applications with Docker",
      "Migration to Kubernetes or managed AWS services",
    ],
    outcome: "Pay only for what you use, and know why.",
    tools: ["aws", "docker", "kubernetes"],
  },
];

export const engagementModels = [
  {
    flag: "--fixed-scope",
    title: "Project",
    body: "A defined outcome for a fixed quote. Example: \"CI/CD and EKS for our app.\"",
    bestFor: "new platforms, migrations",
  },
  {
    flag: "--retainer",
    title: "Monthly support",
    body: "Ongoing DevOps capacity for upgrades, improvements, incident help and reviews.",
    bestFor: "teams without a DevOps hire",
  },
  {
    flag: "--consult",
    title: "Hourly consulting",
    body: "Audits, architecture reviews and pairing sessions with your engineers.",
    bestFor: "second opinions, unblocking",
  },
] as const;

export const processStages = [
  {
    key: "discover",
    title: "Discover",
    body: "An intro call and an audit of your current setup: cloud, repositories, deploy process and what hurts.",
    status: "passed",
  },
  {
    key: "plan",
    title: "Plan",
    body: "A written proposal with architecture, scope, milestones and a clear quote, agreed before work starts.",
    status: "passed",
  },
  {
    key: "build",
    title: "Build",
    body: "Infrastructure as code, pipelines and clusters delivered in small, reviewable pull requests with regular updates.",
    status: "passed",
  },
  {
    key: "handover",
    title: "Hand over",
    body: "Docs, runbooks, dashboards and a walkthrough so your team owns it. Ongoing support is optional.",
    status: "deployed",
  },
] as const;
