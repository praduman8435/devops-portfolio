import type { CSSProperties } from "react";

import { site } from "@/content/site";
import { NetworkCanvas } from "@/components/effects/network-canvas";
import { Terminal } from "@/components/terminal/terminal";
import { buttonClass, CtaArrow } from "@/components/ui/button";
import { TypedRole } from "@/components/ui/typed-role";

const ROLES = ["DevOps Engineer", "Kubernetes & AWS EKS", "CI/CD & GitOps", "Terraform / IaC", "DevSecOps", "Ships full products"] as const;

/** Stagger index for the CSS entrance animation (see .hero-in in globals.css). */
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Server-rendered hero. Its entrance is pure CSS, so the headline (the LCP element) paints with the HTML
 * and doesn't wait for hydration. Only the canvas, the typewriter and the terminal hydrate.
 */
export function Hero() {
  return (
    <section id="top" className="relative flex min-h-svh items-center overflow-hidden pt-[104px] pb-16 sm:pt-[112px] sm:pb-20 lg:pt-[120px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_75%_70%_at_65%_40%,#000_25%,transparent_75%)]"
      >
        <NetworkCanvas />
      </div>

      <div className="container-page relative grid grid-cols-1 items-center gap-12 sm:gap-14 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)] lg:gap-16">
        <div>
          <p
            className="hero-in inline-flex items-center gap-2.5 rounded-full border border-accent/25 bg-accent/5 py-1.5 pr-3.5 pl-3 font-mono text-xs sm:text-[12.5px]"
            style={stagger(0)}
          >
            <span aria-hidden="true" className="ping-dot size-2 rounded-full bg-accent" />
            available for freelance &amp; contract work
          </p>

          <p className="hero-in mt-7 mb-3 font-mono text-sm text-dim sm:mt-8" style={stagger(1)}>
            <span className="mr-1.5 text-accent">$</span>whoami
          </p>

          <h1
            className="hero-rise font-mono text-[clamp(2.6rem,6.8vw,5.6rem)] leading-[0.96] font-extrabold tracking-[-0.055em]"
            style={stagger(1)}
          >
            Praduman
            <br />
            <span className="bg-gradient-to-r from-[#a3b5ab] to-[#5d6c63] bg-clip-text text-transparent">Prajapati</span>
            <span className="text-accent">.</span>
          </h1>

          <p className="hero-in mt-5 min-h-[1.6em] font-mono text-[clamp(1rem,1.8vw,1.3rem)] sm:mt-6" style={stagger(2)}>
            <span aria-hidden="true" className="text-dim">&gt; </span>
            <TypedRole roles={ROLES} />
          </p>

          <p
            className="hero-rise mt-5 max-w-[54ch] text-[clamp(1rem,1.25vw,1.12rem)] leading-relaxed text-muted sm:mt-6"
            style={stagger(3)}
          >
            I design and automate cloud platforms that <span className="text-fg">deploy themselves</span>, taking every{" "}
            <code className="font-mono text-[0.92em] text-accent">git push</code> through tests and security gates to a monitored
            Kubernetes cluster on AWS. You get fewer manual steps, faster releases, and infrastructure your team can trust.
          </p>

          <div className="hero-in mt-8 flex flex-wrap gap-3 sm:mt-9" style={stagger(4)}>
            <a href="#contact" className={buttonClass("primary", "md", "flex-1 sm:flex-none")}>
              start a project <CtaArrow />
            </a>
            <a href="#work" className={buttonClass("ghost", "md", "flex-1 sm:flex-none")}>
              ./view-work
            </a>
          </div>

          <ul
            aria-label="Core skills"
            className="hero-in mt-9 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-xs text-dim sm:mt-11"
            style={stagger(5)}
          >
            {[`${site.yearsExperience}+ yrs in production`, "aws", "kubernetes", "terraform", "gitops", "devsecops"].map((t) => (
              <li key={t}>
                <span className="mr-0.5 text-accent/70">#</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-in" style={stagger(4)}>
          <Terminal />
        </div>
      </div>
    </section>
  );
}
