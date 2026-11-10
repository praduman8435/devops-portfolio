export interface StackGroup {
  dir: string;
  items: Array<{ name: string; note?: string }>;
}

export const stack: StackGroup[] = [
  { dir: "cloud", items: [{ name: "aws" }, { name: "azure" }, { name: "gcp" }] },
  { dir: "containers", items: [{ name: "docker" }, { name: "kubernetes" }, { name: "helm" }, { name: "kubeadm" }] },
  { dir: "ci-cd", items: [{ name: "jenkins" }, { name: "github-actions" }, { name: "gitlab-ci" }, { name: "argocd" }, { name: "nexus" }] },
  { dir: "iac", items: [{ name: "terraform" }, { name: "ansible" }] },
  { dir: "security", items: [{ name: "sonarqube" }, { name: "trivy" }, { name: "rbac & iam" }] },
  { dir: "observability", items: [{ name: "prometheus" }, { name: "grafana" }] },
  { dir: "languages", items: [{ name: "go" }, { name: "python" }, { name: "bash" }, { name: "typescript" }] },
  { dir: "product", items: [{ name: "next.js" }, { name: "react" }, { name: "prisma" }, { name: "postgresql" }, { name: "vercel" }] },
];

export const marqueeItems = [
  "aws", "kubernetes", "amazon eks", "terraform", "jenkins", "github actions", "gitlab ci", "argocd", "helm",
  "docker", "sonarqube", "trivy", "prometheus", "grafana", "ansible", "linux", "golang", "next.js", "postgresql",
];
