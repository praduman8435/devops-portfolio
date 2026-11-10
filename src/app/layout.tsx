import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getSiteUrl, site } from "@/content/site";
import { Toaster } from "@/components/ui/toaster";
import { MotionProvider } from "@/components/ui/motion-provider";
import "./globals.css";

/* Self-hosted variable fonts: no network at build time, no layout shift. */
const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  // Body text: "optional" means no late swap re-paint, which keeps LCP at first paint on slow networks.
  // The metric-adjusted fallback is visually near-identical; cached visits use Inter.
  display: "optional",
});

const jetbrains = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: `${site.name} portfolio`,
  authors: [{ name: site.name, url: site.links.github }],
  creator: site.name,
  keywords: [
    "freelance DevOps engineer",
    "DevOps consultant",
    "AWS EKS",
    "Kubernetes",
    "Terraform",
    "CI/CD",
    "Jenkins",
    "GitHub Actions",
    "ArgoCD",
    "DevSecOps",
    "Prometheus",
    "Grafana",
    "India",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: `${site.name} | Freelance DevOps Engineer`,
    description:
      "CI/CD pipelines, Kubernetes on AWS EKS, Terraform and DevSecOps: automated, secured and monitored. Available for freelance projects.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@CndTwtprad",
    title: `${site.name} | Freelance DevOps Engineer`,
    description: "CI/CD, Kubernetes on AWS EKS, Terraform and DevSecOps. Available for freelance projects.",
  },
  robots: { index: true, follow: true },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#060807",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Minimal root shell shared by every route: fonts, global styles, motion config, toasts and analytics.
 * The portfolio's chrome (boot screen, background, command palette) lives in app/(site)/layout.tsx,
 * so private tools like /radar get a clean, separate shell.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body>
        <MotionProvider>
          {children}
          <Toaster />
        </MotionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
