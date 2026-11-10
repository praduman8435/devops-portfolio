import { getSiteUrl, site } from "@/content/site";
import { BootScreen } from "@/components/effects/boot-screen";
import { PointerEffects } from "@/components/effects/pointer-effects";
import { CommandPaletteLoader } from "@/components/ui/command-palette-loader";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Freelance DevOps Engineer",
  url: getSiteUrl(),
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressCountry: "IN" },
  knowsAbout: ["DevOps", "AWS", "Amazon EKS", "Kubernetes", "Terraform", "CI/CD", "ArgoCD", "DevSecOps", "Prometheus", "Grafana", "Next.js"],
  sameAs: [site.links.github, site.links.linkedin, site.links.x, site.links.blog],
};

/**
 * Runs before the page paints (an inline script is parser-blocking). It decides whether to play the boot
 * sequence (once per session, desktop only, never with reduced motion) and fails open if the app never hydrates.
 */
const bootScript = `(function(){var d=document.documentElement;try{if(!sessionStorage.getItem('pp-booted')&&matchMedia('(pointer: fine) and (min-width: 1024px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.boot='pending'}}catch(e){}setTimeout(function(){if(d.dataset.boot==='pending'){d.dataset.boot='done'}},5000)})();`;

/** Chrome for the public portfolio: boot sequence, ambient background, ⌘K palette, pointer effects. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />

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

      <BootScreen />
      {children}
      <CommandPaletteLoader />
      <PointerEffects />
    </>
  );
}
