export interface Post {
  date: string; // ISO yyyy-mm-dd
  title: string;
  summary: string;
  href: string;
}

const base = "https://itspraduman.hashnode.dev";

export const posts: Post[] = [
  {
    date: "2025-05-20",
    title: "Hosting GitLab on Your Private Server with CI/CD",
    summary: "Self-hosted GitLab on Docker, with GitLab Runner wired up for CI/CD.",
    href: `${base}/self-hosting-gitlab-with-cicd`,
  },
  {
    date: "2025-04-18",
    title: "Enterprise-Grade CI/CD Pipeline with Kubernetes on AWS",
    summary: "Jenkins, Helm, HTTPS ingress, and Prometheus and Grafana monitoring on EKS.",
    href: `${base}/capstone-devops-project-enterprise-grade-cicd-pipeline-with-kubernetes-on-aws-jenkins-helm-ingress-and-monitoring`,
  },
  {
    date: "2025-03-25",
    title: "Ultimate Corporate-Grade DevSecOps Pipeline",
    summary: "Automated Kubernetes deployment with security, CI/CD and monitoring on AWS.",
    href: `${base}/ultimate-corporate-grade-devsecops-pipeline`,
  },
  {
    date: "2025-03-06",
    title: "End-to-End Three-Tier Deployment on AWS EKS",
    summary: "ArgoCD, Jenkins, Prometheus and Grafana: a full DevSecOps walkthrough.",
    href: `${base}/ultimate-devsecops-project-end-to-end-kubernetes-three-tier-deployment-on-aws-eks-with-argocd-prometheus-grafana-and-jenkins`,
  },
  {
    date: "2025-02-21",
    title: "Deploying an Application on AWS EKS with Ingress",
    summary: "EKS on Fargate, exposed through an AWS Application Load Balancer.",
    href: `${base}/deploying-an-application-on-aws-eks-with-ingress-a-step-by-step-guide`,
  },
  {
    date: "2024-09-19",
    title: "A Complete Guide to Terraform",
    summary: "Providers, variables, functions and modules, from first plan to apply.",
    href: `${base}/a-complete-guide-to-terraform-automate-your-infrastructure`,
  },
];

export const kubernetesSeries = {
  title: "Kubernetes, from zero",
  description: "A ten-part, day-by-day deep dive into how Kubernetes actually works.",
  href: `${base}/series/kubernetes-days`,
  parts: [
    "Introduction",
    "Cluster tooling",
    "Imperative vs declarative",
    "Init & sidecar containers",
    "The scheduler",
    "ReplicaSets",
    "ConfigMaps & Secrets",
    "Services",
    "RBAC",
    "Volumes",
  ],
} as const;
