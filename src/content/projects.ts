export interface ProjectLink {
  label: string;
  href: string;
}

export interface DevOpsProject {
  id: string;
  label: string;
  title: string;
  summary: string;
  /** Ordered stages, rendered as a pipeline graph. */
  flow: string[];
  outcome: string;
  tags: string[];
  stars?: number;
  forks?: number;
  language?: string;
  featured?: boolean;
  links: ProjectLink[];
}

export const devopsProjects: DevOpsProject[] = [
  {
    id: "capstone",
    label: "PRJ-01 · pinned",
    title: "Capstone Mega DevOps Project",
    summary:
      "An enterprise-grade DevSecOps pipeline for a Spring Boot microservice on AWS EKS. Every commit is built, quality-gated, versioned in Nexus and shipped to Kubernetes through Helm, behind HTTPS ingress, with Prometheus and Grafana watching production. The EKS infrastructure is provisioned with Terraform and lives in its own repository.",
    flow: ["git push", "Jenkins", "SonarQube", "Nexus", "Docker", "Helm", "EKS", "Grafana"],
    outcome: "A release process where nobody SSHes into a server to deploy.",
    tags: ["AWS EKS", "Terraform", "Jenkins", "SonarQube", "Nexus", "Docker", "Helm", "Prometheus", "Grafana"],
    stars: 21,
    forks: 19,
    featured: true,
    links: [
      { label: "source", href: "https://github.com/praduman8435/Capstone-Mega-DevOps-Project" },
      { label: "terraform", href: "https://github.com/praduman8435/EKS-Terraform" },
      { label: "cd repo", href: "https://github.com/praduman8435/Capstone-Mega-CD-Pipeline" },
      {
        label: "write-up",
        href: "https://itspraduman.hashnode.dev/capstone-devops-project-enterprise-grade-cicd-pipeline-with-kubernetes-on-aws-jenkins-helm-ingress-and-monitoring",
      },
    ],
  },
  {
    id: "devsecops",
    label: "PRJ-02 · pinned",
    title: "DevSecOps in Action",
    summary:
      "An end-to-end three-tier application on AWS EKS with GitOps delivery through ArgoCD, security scanning at every stage, and full observability.",
    flow: ["Terraform", "Jenkins", "SonarQube", "Trivy", "ArgoCD", "EKS", "Prometheus"],
    outcome: "Vulnerabilities caught in CI, with git as the single source of truth for what's running.",
    tags: ["Kubernetes", "ArgoCD", "Jenkins", "Trivy", "SonarQube", "Terraform", "Grafana"],
    stars: 11,
    forks: 10,
    links: [
      { label: "source", href: "https://github.com/praduman8435/DevSecOps-in-Action" },
      {
        label: "write-up",
        href: "https://itspraduman.hashnode.dev/ultimate-devsecops-project-end-to-end-kubernetes-three-tier-deployment-on-aws-eks-with-argocd-prometheus-grafana-and-jenkins",
      },
    ],
  },
  {
    id: "eks-automation",
    label: "PRJ-03 · pinned",
    title: "Production-ready EKS with Automation",
    summary:
      "A fully automated, scalable and cost-optimised AWS EKS cluster, provisioned with Terraform and driven end to end by GitHub Actions.",
    flow: ["git push", "GitHub Actions", "Terraform", "AWS EKS"],
    outcome: "Identical, production-grade clusters for every environment, without manual console work.",
    tags: ["Terraform", "GitHub Actions", "AWS EKS", "Cost-optimised"],
    language: "HCL",
    links: [{ label: "source", href: "https://github.com/praduman8435/Production-ready-EKS-with-automation" }],
  },
];

export interface WorkRow {
  kind: "write-up" | "repo";
  title: string;
  meta: string;
  href: string;
}

export const moreWork: WorkRow[] = [
  {
    kind: "write-up",
    title: "Corporate-grade DevSecOps pipeline on AWS",
    meta: "k8s · ci/cd · security",
    href: "https://itspraduman.hashnode.dev/ultimate-corporate-grade-devsecops-pipeline",
  },
  {
    kind: "write-up",
    title: "Self-hosting GitLab with CI/CD runners",
    meta: "docker · gitlab-runner",
    href: "https://itspraduman.hashnode.dev/self-hosting-gitlab-with-cicd",
  },
  {
    kind: "write-up",
    title: "Apps on AWS EKS with ALB Ingress",
    meta: "eks · fargate · alb",
    href: "https://itspraduman.hashnode.dev/deploying-an-application-on-aws-eks-with-ingress-a-step-by-step-guide",
  },
  {
    kind: "write-up",
    title: "Go web app: end-to-end DevOps automation",
    meta: "go · ci/cd",
    href: "https://itspraduman.hashnode.dev/mastering-devops-transforming-a-go-web-app-with-end-to-end-automation",
  },
  {
    kind: "repo",
    title: "Two-tier Flask application deployment",
    meta: "flask · 2-tier",
    href: "https://github.com/praduman8435/two-tier-flask-app",
  },
  {
    kind: "repo",
    title: "AWS cloud cost optimizer",
    meta: "aws · cost",
    href: "https://github.com/praduman8435/aws-cloud-cost-optimizer",
  },
];
