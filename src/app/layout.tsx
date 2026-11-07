import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getSiteUrl, site } from "@/content/site";
import { BootScreen } from "@/components/effects/boot-screen";
import { PointerEffects } from "@/components/effects/pointer-effects";
import { CommandPaletteLoader } from "@/components/ui/command-palette-loader";
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

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Freelance DevOps Engineer",
  url: siteUrl,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressCountry: "IN" },
  knowsAbout: ["DevOps", "AWS", "Amazon EKS", "Kubernetes", "Terraform", "CI/CD", "ArgoCD", "DevSecOps", "Prometheus", "Grafana", "Next.js"],
  sameAs: [site.links.github, site.links.linkedin, site.links.x, site.links.blog],
};

/**
 * Runs before first paint. It decides whether to play the boot sequence (once per session, desktop only,
 * never with reduced motion) and fails open if the app never hydrates.
 */
const bootScript = `(function(){var d=document.documentElement;try{if(!sessionStorage.getItem('pp-booted')&&matchMedia('(pointer: fine) and (min-width: 1024px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.boot='pending'}}catch(e){}setTimeout(function(){if(d.dataset.boot==='pending'){d.dataset.boot='done'}},5000)})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[200] rounded bg-accent px-4 py-2 font-mono text-sm text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>

        {/* Ambient background layers */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="bg-grid mask-fade-top absolute inset-0" />
          <div className="absolute -top-[380px] -right-[300px] size-[900px] rounded-full bg-[radial-gradient(circle,rgb(90_216_255/0.07),transparent_60%)]" />
          <div className="absolute top-0 left-0 size-[720px] translate-x-[calc(var(--gx)-50%)] translate-y-[calc(var(--gy)-50%)] bg-[radial-gradient(circle,rgb(61_255_143/0.06),transparent_60%)] transition-transform duration-700 ease-out" />
        </div>
        <div aria-hidden="true" className="noise" />
        <div aria-hidden="true" className="scanlines" />

        <MotionProvider>
          <BootScreen />
          {children}
          <CommandPaletteLoader />
          <Toaster />
        </MotionProvider>

        <PointerEffects />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
