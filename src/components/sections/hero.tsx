"use client";

import { motion, type Variants } from "motion/react";

import { useBooted } from "@/hooks/use-boot";
import { site } from "@/content/site";
import { NetworkCanvas } from "@/components/effects/network-canvas";
import { Terminal } from "@/components/terminal/terminal";
import { buttonClass, CtaArrow } from "@/components/ui/button";
import { TypedRole } from "@/components/ui/typed-role";

const ROLES = ["DevOps Engineer", "Kubernetes & AWS EKS", "CI/CD & GitOps", "Terraform / IaC", "DevSecOps", "Ships full products"] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.085, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero() {
  const booted = useBooted();
  const state = booted ? "show" : "hidden";

  return (
    <section id="top" className="relative flex min-h-svh items-center overflow-hidden pt-[112px] pb-20 lg:pt-[120px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_75%_70%_at_65%_40%,#000_25%,transparent_75%)]"
      >
        <NetworkCanvas />
      </div>

      <div className="container-page relative grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)] lg:gap-16">
        <motion.div variants={container} initial="hidden" animate={state}>
          <motion.p
            variants={item}
            className="inline-flex items-center gap-2.5 rounded-full border border-accent/25 bg-accent/5 py-1.5 pr-3.5 pl-3 font-mono text-[12.5px]"
          >
            <span aria-hidden="true" className="size-2 animate-ping-soft rounded-full bg-accent" />
            available for freelance &amp; contract work
          </motion.p>

          <motion.p variants={item} className="mt-8 mb-3 font-mono text-sm text-dim">
            <span className="mr-1.5 text-accent">$</span>whoami
          </motion.p>

          <motion.h1
            variants={item}
            className="font-mono text-[clamp(2.7rem,6.8vw,5.6rem)] leading-[0.96] font-extrabold tracking-[-0.055em]"
          >
            Praduman
            <br />
            <span className="bg-gradient-to-r from-[#a3b5ab] to-[#56655c] bg-clip-text text-transparent">Prajapati</span>
            <span className="text-accent">.</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 min-h-[1.6em] font-mono text-[clamp(1rem,1.8vw,1.3rem)]">
            <span aria-hidden="true" className="text-dim">&gt; </span>
            <TypedRole roles={ROLES} />
          </motion.p>

          <motion.p variants={item} className="mt-6 max-w-[54ch] text-[clamp(1rem,1.25vw,1.12rem)] leading-relaxed text-muted">
            I design and automate cloud platforms that <span className="text-fg">deploy themselves</span>, taking every{" "}
            <code className="font-mono text-[0.92em] text-accent">git push</code> through tests and security gates to a monitored
            Kubernetes cluster on AWS. You get fewer manual steps, faster releases, and infrastructure your team can trust.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <a href="#contact" className={buttonClass("primary", "md", "flex-1 sm:flex-none")}>
              start a project <CtaArrow />
            </a>
            <a href="#work" className={buttonClass("ghost", "md", "flex-1 sm:flex-none")}>
              ./view-work
            </a>
          </motion.div>

          <motion.ul variants={item} aria-label="Core skills" className="mt-11 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-xs text-dim">
            {[`${site.yearsExperience}+ yrs in production`, "aws", "kubernetes", "terraform", "gitops", "devsecops"].map((t) => (
              <li key={t}>
                <span className="mr-0.5 text-accent/70">#</span>
                {t}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={booted ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.985 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <Terminal />
        </motion.div>
      </div>
    </section>
  );
}
